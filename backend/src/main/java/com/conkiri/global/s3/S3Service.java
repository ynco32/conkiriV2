package com.conkiri.global.s3;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

	@Value("${cloud.aws.s3.bucket}")
	private String bucket;

	private final S3Client s3Client;

	// 이미지 업로드
	public String uploadImage(MultipartFile file, String dirName) {

		if (file.getSize() == 0) { throw new BaseException(ErrorCode.FILE_NOT_EMPTY); }

		SimpleDateFormat sdf = new SimpleDateFormat("/yyyy/MM/dd/HH/");
		String subDir = sdf.format(new Date());

		String fileName = dirName + subDir + UUID.randomUUID() + "_" + file.getOriginalFilename();

		try {
			PutObjectRequest putObjectRequest = PutObjectRequest.builder()
				.bucket(bucket)
				.key(fileName)
				.contentType(file.getContentType())
				.build();

			s3Client.putObject(putObjectRequest,
				RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

			GetUrlRequest getUrlRequest = GetUrlRequest.builder()
				.bucket(bucket)
				.key(fileName)
				.build();

			return s3Client.utilities().getUrl(getUrlRequest).toString();
		} catch (IOException e) {
			log.error("이미지 업로드 실패: {}", e.getMessage());
			throw new RuntimeException("이미지 업로드 실패", e);
		}
	}

	// 이미지 삭제
	public void deleteImage(String imageUrl) {
		try {
			String fileName = imageUrl.substring(imageUrl.indexOf("com/") + 4);

			DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
				.bucket(bucket)
				.key(fileName)
				.build();

			s3Client.deleteObject(deleteObjectRequest);
		} catch (Exception e) {
			log.error("이미지 삭제 실패: {}, 이미지 URL: {}", e.getMessage(), imageUrl);
		}
	}
}