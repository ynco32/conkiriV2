import os
import logging
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA

# 환경 변수 로드
load_dotenv()

# 로깅 설정
logger = logging.getLogger(__name__)

def split_documents(paragraphs, concert_info):
    """문단들을 더 작은 청크로 분할합니다."""
    logger.info("문단을 청크로 분할 중...")
    
    # RecursiveCharacterTextSplitter 설정
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,  # 청크 크기
        chunk_overlap=50,  # 청크 간 중복 (문맥 유지를 위해)
        separators=["\n\n", "\n", ".", ",", " ", ""]
    )
    
    all_texts = []
    all_metadatas = []
    
    # 각 문단을 처리
    for i, paragraph in enumerate(paragraphs):
        text = paragraph["text"]

        para_metadata = paragraph["metadata"]  # 그룹화된 문단에는 항상 metadata가 있음

        metadata = {
            "concert_id": concert_info["concert_id"],
            "paragraph_id": i,
            "top_y": para_metadata.get("top_y"),
            "bottom_y": para_metadata.get("bottom_y"),
            "category": para_metadata.get("category", "일반 정보")
        }

        
        # 콘서트 정보 메타데이터 추가 
        metadata["concert_name"] = concert_info["concert_name"]
        metadata["arena_name"] = concert_info["arena_name"]
        
        # 아티스트 정보는 문자열로 변환하여 추가 (검색 가능하게) 
        artists = concert_info.get("artist_name", [])
        if artists:
            metadata["artists"] = ", ".join(artists)
        
        # 티켓팅 정보 추가 
        metadata["ticketing_platform"] = concert_info.get("ticketing_platform")
        
        # 텍스트 분할
        splits = text_splitter.split_text(text)
        
        # 각 분할에 메타데이터 추가
        for j, split in enumerate(splits):
            all_texts.append(split)
            split_metadata = metadata.copy()
            split_metadata["chunk_id"] = f"{i}-{j}"
            split_metadata["text_snippet"] = split[:100]  # 검색 결과에서 확인할 수 있는 미리보기
            all_metadatas.append(split_metadata)
    
    logger.info(f"총 {len(all_texts)}개의 청크로 분할되었습니다.")
    return all_texts, all_metadatas


def expand_query(original_query, conversation_history=None):
    """사용자 쿼리를 확장하여 더 관련성 높은 검색 결과를 얻습니다."""
    logger.info(f"원본 쿼리: '{original_query}'")
    
    # 대화 맥락이 있는 경우 이를 포함한 프롬프트 구성
    context_text = ""
    if conversation_history and len(conversation_history) > 0:
        # 최근 1-2개 대화만 포함 (맥락 창 제한)
        recent_history = conversation_history[-2:] if len(conversation_history) > 2 else conversation_history
        context_lines = []
        for turn in recent_history:
            context_lines.append(f"사용자: {turn['user']}")
            context_lines.append(f"봇: {turn['bot']}")
        context_text = "\n".join(context_lines)
        logger.info(f"최근 {len(recent_history)}개 대화 맥락 포함")
    
    # 맥락 포함 여부에 따른 프롬프트 구성
    if context_text:
        context_part = f"최근 대화 맥락:\n{context_text}\n"
    else:
        context_part = ""
    
    # 프롬프트 개선 (명확한 지침과 예시 추가) 👈
    expand_prompt = f"""
    당신은 검색 쿼리 확장 도구입니다. 사용자의 질문을 분석하고 검색에 유용한 추가 키워드를 제공하세요.
    
    원본 질문: "{original_query}"
    
    {context_part}
    
    지시사항:
    1. 주어진 질문을 확장하여 더 많은 관련 문서를 찾을 수 있도록 키워드를 추가하세요
    2. 원본 질문의 핵심 주제를 파악하세요
    3. 핵심 주제와 직접 관련된 동의어와 유사어만 2~5개 추가하세요
    4. 주제와 관련 없는 키워드는 절대 추가하지 마세요
    5. 원본 질문이 우선시 되어야 합니다
    6. 주요 단어의 다른 표현만 추가하고, 다른 주제로 확장하지 마세요
    
    예시:
    원본: "좌석 수는 몇 개인가요?"
    좋은 확장: 좌석 수는 몇 개 좌석 좌석배치도 좌석수
    나쁜 확장: 좌석 수 몇 개 매표소 위치 티켓부스 위치 티켓 수령 방법

    원본: "매표소가 어디인가요?"
    좋은 확장: 매표소가 어디 매표소위치 위치 매표장소
    나쁜 확장: 매표소가 어디 예매 방법 예매 취소 수수료

    출력 예시:
    선예매 일정 티켓 예매 시작 날짜 콘서트 티켓팅 날짜 팬클럽 사전예약
    
    출력:
    """
    
    # OpenAI API 호출
    from openai import OpenAI
    client = OpenAI()
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            # 시스템 메시지 개선 👈
            {"role": "system", "content": "당신은 검색 키워드 확장 도구입니다. 지시사항을 정확히 따르세요."},
            {"role": "user", "content": expand_prompt}
        ],
        temperature=0.3,
    )
    
    expanded_query = response.choices[0].message.content.strip()
    
    # 불필요한 접두사와 따옴표 제거 (신규 추가) 👈
    unwanted_prefixes = [
        "출력:", "확장된 검색어:", "키워드:", "검색어:", "쿼리:", 
        "\"", "\'", """, """
    ]
    
    for prefix in unwanted_prefixes:
        if expanded_query.startswith(prefix):
            expanded_query = expanded_query[len(prefix):].strip()
    
    # 불필요한 따옴표 제거
    expanded_query = expanded_query.strip('"\'')

    final_query = f"{original_query} {expanded_query} {original_query}"
    
    logger.info(f"쿼리 확장: '{original_query}' → '{final_query}'")
    
    return expanded_query


# gpt 다시 시도 ver
def create_rag_chain(vectorstore):
    """RAG 질의응답 체인을 생성합니다."""
    logger.info("RAG 체인 생성 중...")
    
    # 단순 래퍼 객체 생성 (벡터스토어 검색기만 포함)
    class SimpleRAGChain:
        def __init__(self, retriever, vectorstore):
            self.retriever = retriever
            self.vectorstore = vectorstore
            self.conversation_history = []

            
        def __call__(self, query_dict):
            # 더미 메서드 (실제로는 query_rag_system에서 처리)
            return {"result": "This is a placeholder", "source_documents": []}
    
    # 기본 검색기 가져오기
    retriever = vectorstore.as_retriever(search_kwargs={"k": 7})
    
    # 단순 체인 생성
    chain = SimpleRAGChain(retriever, vectorstore)
    
    logger.info("RAG 체인 생성 완료!")
    return chain



def query_rag_system(chain, query, concert_id=None, concert_info=None):
    """RAG 시스템에 질의합니다."""
    logger.info(f"질의 처리 중: '{query}'")
    
    try:
        # 1. 쿼리 확장 (대화 맥락 고려) 
        expanded_query = expand_query(query, chain.conversation_history)
        
        # 2. 검색 필터 설정 (변경 없음)
        search_kwargs = {"k": 5}  
        if concert_id:
            search_kwargs["filter"] = {"concert_id": concert_id}
        
        # 3. 확장된 쿼리로 검색 
        logger.info(f"확장된 쿼리로 검색: '{expanded_query}'")
        docs = chain.vectorstore.similarity_search(
            expanded_query, 
            **search_kwargs
        )
        logger.info(f"검색 결과: {len(docs)}개 문서 검색됨")
        
        # 4. 원본 콘텐츠 저장 (딕셔너리 사용) (변경 없음)
        original_contents = {}
        for i, doc in enumerate(docs):
            original_contents[i] = doc.page_content
            
            # ID 부여된 콘텐츠로 변경
            doc.page_content = f"[문서 #{i+1}]\n{doc.page_content}\n[문서 #{i+1} 끝]"
        
        # 5. 검색 결과를 컨텍스트로 변환 (변경 없음)
        context = "\n\n".join([doc.page_content for doc in docs])

        # DB 정보 문자열 준비
        db_info = ""
        if concert_info:
            # datetime 객체를 문자열로 변환 
            start_times = concert_info.get('start_times', [])
            times_str_list = []
            for time_obj in start_times:
                if hasattr(time_obj, 'strftime'):  # datetime 객체인 경우 👈
                    times_str_list.append(time_obj.strftime('%Y-%m-%d %H:%M:%S'))
                else:  # 이미 문자열인 경우
                    times_str_list.append(str(time_obj))
            
            # 선예매/일반예매 시간 문자열 변환 
            adv_res = concert_info.get('advanced_reservation')
            if hasattr(adv_res, 'strftime'):
                adv_res = adv_res.strftime('%Y-%m-%d %H:%M:%S')
                
            res = concert_info.get('reservation')
            if hasattr(res, 'strftime'):
                res = res.strftime('%Y-%m-%d %H:%M:%S')
            
            db_info = f"""
        <DB_정보>
        콘서트 이름: {concert_info.get('concert_name', '정보 없음')}
        공연장: {concert_info.get('arena_name', '정보 없음')}
        아티스트: {', '.join(concert_info.get('artists', ['정보 없음']))}
        선예매 시작: {adv_res if adv_res else '정보 없음'}
        일반예매 시작: {res if res else '정보 없음'}
        티켓팅 플랫폼: {concert_info.get('ticketing_platform', '정보 없음')}
        공연 시작 시간: {', '.join(times_str_list) if times_str_list else '정보 없음'}
        </DB_정보>
        """
        
        # 6. 답변 생성 프롬프트 
        prompt = f"""
당신은 콘서트 관련 정보를 제공하는 도우미인 '콘끼리봇'입니다. 
아래 제공된 콘서트 공지사항 정보와 DB 정보를 바탕으로 사용자의 질문에 정확하게 답변해주세요.
말끝마다 '뿌우'를 붙여주세요. 예: "안녕하세요, 뿌우"

{db_info}

<콘서트_정보>
{context}
</콘서트_정보>

질문: {query}

지침:
1. 답변 전에 먼저 문서에서 정확한 사실을 찾으세요. 문서에 명시적으로 있는 정보만 사용하세요. 
2. 정확한 날짜, 시간, 금액 등 구체적인 수치는 반드시 문서에서 그대로 인용하세요.
3. 추측이나 일반적인 지식을 사용하지 마세요. 문서에 없는 내용은 "공지사항에서 찾을 수 없습니다"라고 명확히 말하세요.
4. 공연 시간, 날짜에 관한 질문에는 모든 공연 일자와 시간을 반드시 전부 알려주세요. (예: "5월 17일은 오후 6시, 5월 18일은 오후 4시에 시작합니다."). 그리고 입장시작 시간과 공연시작 시간은 다르다는 것을 유의해주세요.
5. 위치 관련 질문에는 정확한 위치 정보가 있을 경우만 답변하고, 없으면 "공지사항에서 위치 정보를 찾을 수 없습니다"라고 명확히 말하세요.
6. 질문에 대한 정보가 없을 때는, "공지사항에서 [특정 내용]에 대한 정보를 찾을 수 없습니다"라고 명확히 말한 후, 관련된 다른 정보가 있다면 함께 제공하세요.
7. 콘서트 이름, 공연장, 아티스트, 티켓팅 플랫폼이 뭔지 묻는 단순한 질문에는 DB_정보를 우선적으로 사용하세요.
8. 답변의 출처가 되는 가장 중요한 문서 ID 하나만 선택하세요. 질문 관련 정보가 콘서트_정보에 전혀 없으면 "없음"으로 표시하세요. DB_정보로만 답변을 한 경우에도 "없음"으로 표시하세요.
9. 정확히 아래 형식만 사용하세요. 다른 형식이나 표현(예: "출처:", "참고:", 등)은 사용하지 마세요.

[답변]
당신의 답변 내용을 여기에 작성하세요.

[참조_문서]
#숫자 또는 없음

예시 응답 1:
[답변]
콘서트는 5월 17일 오후 6시에 시작합니다. 뿌우

[참조_문서]
#3

예시 응답 2:
[답변]
제공된 정보에서 물품 보관소의 위치에 대한 정보를 찾을 수 없습니다. 다만, 물품 보관소는 공연 시작 6시간 전부터 운영되며, 이용 요금은 5,000원입니다. 뿌우

[참조_문서]
#1
"""
        
        system_message = """
콘끼리는 콘서트 관람을 돕는 어플이이고 너는 그 어플 속에서 콘서트 정보를 정확히 알려주는 콘끼리 챗봇이야. 
중요한 규칙:
1. 절대 할루시네이션하지 마세요! 제공된 문서에 명시적으로 있는 정보만 사용하세요.
2. 문서에 없는 정보는 만들어내지 마세요. 사실 확인을 철저히 하세요.
3. 모든 공연 날짜와 시간을 질문 시 항상 함께 알려주세요.
4. 정확하게 "뿌우"로 모든 답변을 끝내세요.
5. 절대로 가격, 시간, 위치 등의 정보를 추측하지 마세요.
6. 콘끼리 이용법에 대해 묻는 질문에 대해서는 온보딩 페이지를 참고해달라고 하세요. 
"""
        
        # 7. GPT 호출 (변경 없음)
        from openai import OpenAI
        client = OpenAI()
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
        )
        
        answer_text = response.choices[0].message.content
        logger.info(f"GPT 응답: {answer_text[:500]}...")
        
        # 8. GPT 응답 파싱 (개선) 👈
        import re
        answer_match = re.search(r'\[답변\](.*?)(?=\[참조_문서\]|\Z)', answer_text, re.DOTALL)
        doc_match = re.search(r'\[참조_문서\]\s*(?:#?(\d+)|없음)', answer_text)
        
        if answer_match:
            answer = answer_match.group(1).strip()
        else:
            answer = answer_text
        
        # 9. 좌표 정보 추출 (개선) 👈
        evidence_coordinates = []
        referenced_doc_id = None
        has_reference = False  # 👈 유효한 참조 여부 추적
        
        if doc_match:
            reference_text = doc_match.group(0).strip()
            if "없음" in reference_text:
                logger.info("GPT: 관련 참조 문서 없음")
                # 👈 "없음"인 경우 좌표 추가하지 않음 (의도적으로 빈 배열 유지)
            elif doc_match.group(1):
                try:
                    # 참조 문서 ID 추출 (1부터 시작)
                    referenced_doc_id = int(doc_match.group(1)) - 1  # 0-based 인덱스로 변환
                    logger.info(f"참조된 문서 ID: #{referenced_doc_id+1}")
                    has_reference = True  # 👈 유효한 참조 표시
                    
                    if 0 <= referenced_doc_id < len(docs):
                        # 해당 문서의 메타데이터에서 좌표 추출
                        doc = docs[referenced_doc_id]
                        if hasattr(doc, 'metadata') and 'top_y' in doc.metadata and 'bottom_y' in doc.metadata:
                            evidence_coordinates.append({
                                "top_y": doc.metadata['top_y'],
                                "bottom_y": doc.metadata['bottom_y']
                            })
                            logger.info(f"문서 #{referenced_doc_id+1}에서 좌표 추출: top_y={doc.metadata['top_y']}, bottom_y={doc.metadata['bottom_y']}")
                        else:
                            logger.warning(f"문서 #{referenced_doc_id+1}에 좌표 메타데이터가 없습니다")
                    else:
                        logger.warning(f"참조된 문서 ID #{referenced_doc_id+1}가 유효하지 않습니다. 총 문서 수: {len(docs)}")
                except (ValueError, IndexError) as e:
                    logger.warning(f"참조 문서 ID 처리 오류: {str(e)}")
        else:
            logger.warning("GPT 응답에서 참조 문서 ID를 찾을 수 없습니다")
        
        # 10. 문서 콘텐츠 복원 (변경 없음)
        for i, doc in enumerate(docs):
            if i in original_contents:
                doc.page_content = original_contents[i]
        
        # 11. 대화 기록 업데이트 (신규 추가) 👈
        chain.conversation_history.append({
            "user": query,
            "bot": answer
        })
        
        # 대화 기록 크기 제한 (최대 5개 턴만 유지) 👈
        if len(chain.conversation_history) > 5:
            chain.conversation_history = chain.conversation_history[-5:]
        
        # 12. 응답 구성 (개선) 👈
        response = {
            "answer": answer,
            "source_documents": [],
            "evidence_coordinates": evidence_coordinates if has_reference else [],  # 👈 참조가 없으면 빈 좌표 배열
            "referenced_doc_id": referenced_doc_id
        }
        
        # 소스 문서 추가 (원본 콘텐츠로 복원)
        response["source_documents"] = [
            {
                "content": doc.page_content,
                "metadata": doc.metadata if hasattr(doc, 'metadata') else {}
            } for doc in docs
        ]
        
        logger.info("질의 처리 완료")
        return response
        
    except Exception as e:
        logger.error(f"질의 처리 중 오류: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        
        # 간소화된 답변 반환
        return {
            "answer": f"죄송합니다, 질문에 답변하는 과정에서 오류가 발생했습니다 뿌우...",
            "error": str(e),
            "source_documents": [],
            "evidence_coordinates": []
        }