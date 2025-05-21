package com.conkiri.domain.view.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.base.repository.ArenaRepository;
import com.conkiri.domain.base.repository.ConcertRepository;
import com.conkiri.domain.user.entity.User;
import com.conkiri.domain.view.dto.request.ReviewRequestDTO;
import com.conkiri.domain.view.dto.response.ConcertDTO;
import com.conkiri.domain.view.dto.response.ReviewDetailResponseDTO;
import com.conkiri.domain.view.dto.response.ReviewResponseDTO;
import com.conkiri.domain.view.dto.response.SectionResponseDTO;
import com.conkiri.domain.view.entity.Review;
import com.conkiri.domain.view.entity.ReviewPhoto;
import com.conkiri.domain.view.entity.Seat;
import com.conkiri.domain.view.repository.ReviewPhotoRepository;
import com.conkiri.domain.view.repository.ReviewRepository;
import com.conkiri.domain.view.repository.SeatRepository;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;
import com.conkiri.global.s3.S3Service;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ViewService {

	private final ConcertRepository concertRepository;
	private final SeatRepository seatRepository;
	private final ReviewRepository reviewRepository;
	private final ReviewPhotoRepository reviewPhotoRepository;
	private final ArenaRepository arenaRepository;
	private final S3Service s3Service;

	// 후기 작성
	public Long createReview(ReviewRequestDTO dto, List<MultipartFile> files, User user) {
		validatePhotoCount(getFileCount(files));

		Concert concert = getConcert(dto.concertId());
		Seat seat = getSeat(dto, concert);

		Review review = Review.of(dto, user, concert, seat);
		reviewRepository.save(review);

		saveReviewPhotos(files, review);

		return review.getReviewId();
	}

	// 후기 단건(수정할 후기) 조회
	public ReviewDetailResponseDTO getAReview(Long reviewId) {
		Review review = getReview(reviewId);
		List<String> photoUrls = reviewPhotoRepository.findAllByReview(review)
			.stream()
			.map(ReviewPhoto::getPhotoUrl)
			.toList();

		return ReviewDetailResponseDTO.of(review, photoUrls);
	}

	// 후기 수정
	public Long updateReview(Long reviewId, ReviewRequestDTO dto, List<MultipartFile> newFiles, User user) {
		Review review = getReview(reviewId);
		validateReviewOwner(review, user);

		Concert concert = getConcert(dto.concertId());
		Seat seat = getSeat(dto, concert);

		List<String> keepUrls = getKeepUrls(dto);
		int totalPhotoCount = keepUrls.size() + getFileCount(newFiles);
		validatePhotoCount(totalPhotoCount);

		updateReviewPhotos(review, keepUrls, newFiles);
		review.update(dto, seat, concert);

		return review.getReviewId();
	}

	// 후기 삭제
	public Void deleteReview(Long reviewId, User user) {
		Review review = getReview(reviewId);
		validateReviewOwner(review, user);
		List<ReviewPhoto> reviewPhotos = reviewPhotoRepository.findAllByReview(review);

		deletePhotos(reviewPhotos);
		reviewRepository.delete(review);

		return null;
	}

	// (선택한 공연장의) 구역 정보 조회
	public List<SectionResponseDTO> getSections(Long arenaId) {
		if (!arenaRepository.existsById(arenaId))
			throw new BaseException(ErrorCode.ARENA_NOT_FOUND);

		return seatRepository.findDistinctSectionsByArenaId(arenaId);
	}

	// (선택한 구역의) 모든 후기 조회
	public ReviewResponseDTO getReviewsOfSection(Long arenaId, String section) {
		List<Review> reviews = reviewRepository.findAllByArenaIdAndSection(arenaId, section);

		return getReviews(reviews);
	}

	// 가수로 콘서트 검색
	public List<ConcertDTO> getConcerts(String searchWord) {
		List<Concert> concerts = concertRepository.findConcertsByArtist(searchWord);

		return concerts.stream()
			.map(ConcertDTO::from)
			.toList();
	}

	// ========== 이하 공통 메서드 ==========

	private int getFileCount(List<MultipartFile> files) {
		return files == null ? 0 : (int) files.stream().filter(f -> f != null && !f.isEmpty()).count();
	}

	private void validatePhotoCount(int count) {
		if (count == 0) throw new BaseException(ErrorCode.FILE_NOT_EMPTY);
		if (count > 3) throw new BaseException(ErrorCode.MAX_FILE_COUNT_EXCEEDED);
	}

	private Concert getConcert(Long concertId) {
		return concertRepository.findById(concertId)
			.orElseThrow(() -> new BaseException(ErrorCode.CONCERT_NOT_FOUND));
	}

	private Seat getSeat(ReviewRequestDTO dto, Concert concert) {
		return seatRepository
			.findSeatBySectionAndRowLineAndColumnLineAndArena_ArenaId(dto.section(), dto.rowLine(), dto.columnLine(), concert.getArena().getArenaId())
			.orElseThrow(() -> new BaseException(ErrorCode.SEAT_NOT_FOUND));
	}

	private Review getReview(Long reviewId) {
		return reviewRepository.findByReviewId(reviewId)
			.orElseThrow(() -> new BaseException(ErrorCode.REVIEW_NOT_FOUND));
	}

	private void validateReviewOwner(Review review, User user) {
		if (!review.getUser().getUserId().equals(user.getUserId()))
			throw new BaseException(ErrorCode.UNAUTHORIZED_ACCESS);
	}

	private List<String> getKeepUrls(ReviewRequestDTO dto) {
		return dto.existingPhotoUrls() == null ? List.of() : dto.existingPhotoUrls().stream()
			.filter(StringUtils::hasText)
			.toList();
	}

	private void saveReviewPhotos(List<MultipartFile> files, Review review) {
		if (files == null || files.isEmpty()) return;
		List<ReviewPhoto> photos = files.stream()
			.filter(f -> f != null && !f.isEmpty())
			.map(file -> createReviewPhoto(file, review))
			.toList();

		reviewPhotoRepository.saveAll(photos);
	}

	private void updateReviewPhotos(Review review, List<String> keepUrls, List<MultipartFile> newFiles) {
		List<ReviewPhoto> existingPhotos = reviewPhotoRepository.findAllByReview(review);
		List<ReviewPhoto> photosToDelete = existingPhotos.stream()
			.filter(photo -> keepUrls.stream().noneMatch(url -> url.trim().equals(photo.getPhotoUrl().trim())))
			.toList();

		List<ReviewPhoto> photosToAdd = (newFiles == null ? List.<MultipartFile>of() : newFiles).stream()
			.filter(f -> f != null && !f.isEmpty())
			.map(file -> createReviewPhoto(file, review))
			.toList();

		deletePhotos(photosToDelete);

		reviewPhotoRepository.saveAll(photosToAdd);
	}

	private void deletePhotos(List<ReviewPhoto> photos) {
		List<String> photoUrls = photos.stream()
			.map(ReviewPhoto::getPhotoUrl)
			.toList();

		reviewPhotoRepository.deleteAll(photos);

		for (String url : photoUrls)
			s3Service.deleteImage(url);
	}

	private ReviewPhoto createReviewPhoto(MultipartFile file, Review review) {
		String dirName = "reviews";
		String url = s3Service.uploadImage(file, dirName);

		return ReviewPhoto.of(review, url);
	}

	public ReviewResponseDTO getReviews(List<Review> reviews) {
		List<Long> reviewIds = reviews.stream()
			.map(Review::getReviewId)
			.toList();

		List<ReviewPhoto> allPhotos = reviewPhotoRepository.findAllByReviewIdIn(reviewIds);

		Map<Long, List<String>> reviewPhotoMap = allPhotos.stream()
			.collect(Collectors.groupingBy(
				rp -> rp.getReview().getReviewId(),
				Collectors.mapping(ReviewPhoto::getPhotoUrl, Collectors.toList())
			));

		return ReviewResponseDTO.of(reviews, reviewPhotoMap);
	}
}