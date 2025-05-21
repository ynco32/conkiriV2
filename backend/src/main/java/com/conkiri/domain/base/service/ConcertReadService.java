package com.conkiri.domain.base.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.base.repository.ConcertRepository;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConcertReadService {

	private final ConcertRepository concertRepository;

	public Concert findConcertByIdOrElseThrow(Long concertId) {

		return concertRepository.findById(concertId)
			.orElseThrow(() -> new BaseException(ErrorCode.CONCERT_NOT_FOUND));
	}


}
