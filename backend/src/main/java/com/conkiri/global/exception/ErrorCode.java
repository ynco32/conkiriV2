package com.conkiri.global.exception;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    /**
     * Response의 에러 코드에 맞춰 HttpStatus를 설정해주시기 바랍니다.
     * // fail
     * BAD_REQUEST(400)
     * UNAUTHORIZED(401)
     * FORBIDDEN(403)
     * NOT_FOUND(404)
     * METHOD_NOT_ALLOWED(405)
     * INTERNAL_SERVER_ERROR(500)
     **/

    // Global Exception
    BAD_REQUEST_ERROR(HttpStatus.BAD_REQUEST, "잘못된 요청입니다."),
    INVALID_HTTP_MESSAGE_BODY(HttpStatus.BAD_REQUEST, "HTTP 요청 바디의 형식이 잘못되었습니다."),
    UNSUPPORTED_HTTP_METHOD(HttpStatus.METHOD_NOT_ALLOWED, "지원하지 않는 HTTP 메서드입니다."),
    SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부에서 알 수 없는 오류가 발생했습니다."),
    BIND_ERROR(HttpStatus.BAD_REQUEST, "요청 파라미터 바인딩에 실패했습니다."),
    ARGUMENT_TYPE_MISMATCH(HttpStatus.BAD_REQUEST, "요청 파라미터 타입이 일치하지 않습니다."),

    // 회원
    USER_NOT_FOUND(HttpStatus.BAD_REQUEST, "사용자를 찾을 수 없습니다."),
    ALREADY_EXIST_USER(HttpStatus.CONFLICT, "이미 존재하는 회원입니다."),
    DUPLICATE_NICKNAME(HttpStatus.CONFLICT, "중복된 닉네임입니다."),
    INVALID_NICKNAME(HttpStatus.BAD_REQUEST, "사용할 수 없는 닉네임입니다."),
    NICKNAME_NOT_EMPTY(HttpStatus.BAD_REQUEST, "닉네임은 필수값입니다."),
    ERROR_NICKNAME_LENGTH(HttpStatus.BAD_REQUEST, "닉네임은 2자 이상 10자 이하여야 합니다."),
    ERROR_NICKNAME_FORMAT(HttpStatus.BAD_REQUEST, "닉네임은 공백 없이 한글, 영문, 숫자만 가능합니다."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "권한이 없습니다."),

    // 인증
    OAUTH2_FAILURE(HttpStatus.UNAUTHORIZED, "OAuth2 인증에 실패했습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    AUTH_NOT_FOUND(HttpStatus.UNAUTHORIZED, "인증 정보가 없습니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "만료된 토큰입니다."),

    // 나눔
    CONCERT_NOT_FOUND(HttpStatus.BAD_REQUEST, "콘서트를 찾을 수 없습니다."),
    SEARCH_RESULT_NULL(HttpStatus.BAD_REQUEST, "검색 결과를 찾을 수 없습니다."),
    SHARING_NOT_FOUND(HttpStatus.BAD_REQUEST, "나눔 게시글을 찾을 수 없습니다."),
    STATUS_INVALID(HttpStatus.BAD_REQUEST, "유효하지 않은 값입니다."),
    SCRAP_SHARING_NOT_FOUND(HttpStatus.BAD_REQUEST, "스크랩한 나눔 게시글을 찾을 수 없습니다."),
    ALREADY_EXIST_SCRAP_SHARING(HttpStatus.CONFLICT, "이미 스크랩한 나눔 게시글입니다."),
    BLANK_IS_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "내용을 입력해주세요."),
    NULL_IS_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "필수값입니다."),
    COMMENT_NOT_FOUND(HttpStatus.BAD_REQUEST, "댓글을 찾을 수 없습니다."),
    FILE_NOT_EMPTY(HttpStatus.BAD_REQUEST, "파일이 첨부되지 않았습니다."),

    // 시야
    ARENA_NOT_FOUND(HttpStatus.BAD_REQUEST, "공연장을 찾을 수 없습니다."),
    UNAUTHORIZED_ACCESS(HttpStatus.UNAUTHORIZED, "해당 사용자에게 권한이 없습니다."),
    SEAT_NOT_FOUND(HttpStatus.BAD_REQUEST, "좌석을 찾을 수 없습니다."),
    REVIEW_NOT_FOUND(HttpStatus.BAD_REQUEST, "리뷰를 찾을 수 없습니다."),
    MAX_FILE_COUNT_EXCEEDED(HttpStatus.BAD_REQUEST, "사진은 최대 3장까지 첨부 가능합니다."),
    SECTION_LAYOUT_NOT_FOUND(HttpStatus.NOT_FOUND, "좌석 레이아웃 정보를 찾을 수 없습니다."),
    LAYOUT_PARSING_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "좌석 레이아웃 파싱에 실패했습니다."),
    ENTITY_NOT_FOUND(HttpStatus.NOT_FOUND, "요청한 엔티티를 찾을 수 없습니다."),
    JSON_DATA_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "JSON 데이터 형식 오류입니다."),

    // 콘서트
    DUPLICATE_TICKETING(HttpStatus.CONFLICT, "티켓팅에 참여한 내역이 있어 참여할 수 없습니다."),
    ALREADY_RESERVED_SEAT(HttpStatus.CONFLICT, "이미 선택된 좌석입니다."),
    NOT_START_TICKETING(HttpStatus.BAD_REQUEST, "티켓팅이 아직 시작되지 않았습니다."),
    INVALID_SECTION(HttpStatus.BAD_REQUEST, "유효하지 않은 구역입니다."),
    INVALID_SEAT(HttpStatus.BAD_REQUEST, "유효하지 않은 좌석입니다."),
    RECORD_NOT_FOUND(HttpStatus.BAD_REQUEST, "티켓팅 결과를 찾을 수 없습니다."),
    NO_TICKETING_TODAY(HttpStatus.BAD_REQUEST, "오늘은 티켓팅이 없습니다."),
    INVALID_TICKETING_TIME(HttpStatus.BAD_REQUEST, "종료 시간은 시작 시간보다 이전일 수 없습니다"),

    // 현장
    INVALID_CATEGORY(HttpStatus.BAD_REQUEST, "존재하지 않는 카테고리입니다."),
    CHAT_ROOM_NOT_FOUND(HttpStatus.BAD_REQUEST, "채팅방을 찾을 수 없습니다."),

    // 알림
    FAIL_NOTIFICATION(HttpStatus.BAD_REQUEST, "알림 발송 실패"),
    MESSAGE_QUEUE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "메시지 큐 처리 중 오류가 발생했습니다."),
    NOTIFICATION_NOT_FOUND(HttpStatus.BAD_REQUEST, "알림이 존재하지 않습니다."),

	// 가수
	ARTIST_NOT_FOUND(HttpStatus.BAD_REQUEST, "가수를 찾을 수 없습니다."),
	ALREADY_EXIST_MY_ARTIST(HttpStatus.CONFLICT, "이미 등록한 가수입니다."),
	MY_ARTIST_NOT_FOUND(HttpStatus.BAD_REQUEST, "등록한 가수를 찾을 수 없습니다."),

	// 공연
	CONCERT_DETAIL_NOT_FOUND(HttpStatus.BAD_REQUEST, "회차 정보를 찾을 수 없습니다"),

    // 콘서트 정보 저장
    RESOURCE_NOT_FOUND(HttpStatus.BAD_REQUEST, "공연장 정보가 없습니다."),

    // 나의 공연
    MY_CONCERT_NOT_FOUND(HttpStatus.BAD_REQUEST, "등록한 나의 공연이 없습니다."),

	;
    private final HttpStatus httpStatus;
    private final String message;
}
