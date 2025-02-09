package com.insta.InstaApp.aws;

import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;

public class Handler {
    private final S3Client s3Client;

    public Handler() {
        s3Client = DependencyFactory.s3Client();
    }

    public void uploadImage(MultipartFile multipartFile) {
        String bucket = "kev-insta-bucket"; //TODO change to env var or equivalent
        String key = multipartFile.getOriginalFilename();

        PutObjectRequest por =  PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(multipartFile.getContentType())
                .contentLength(multipartFile.getSize())
                .build();
        try {
            s3Client.putObject(por, RequestBody.fromInputStream(multipartFile.getInputStream(), multipartFile.getSize()));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteImage(String key){
        String bucket = "kev-insta-bucket"; //TODO change to env var or equivalent
        s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
    }
//    public static void createBucket(S3Client s3Client, String bucketName) {
//        try {
//            s3Client.createBucket(CreateBucketRequest
//                    .builder()
//                    .bucket(bucketName)
//                    .build());
//            System.out.println("Creating bucket: " + bucketName);
//            s3Client.waiter().waitUntilBucketExists(HeadBucketRequest.builder()
//                    .bucket(bucketName)
//                    .build());
//            System.out.println(bucketName + " is ready.");
//            System.out.printf("%n");
//        } catch (S3Exception e) {
//            System.err.println(e.awsErrorDetails().errorMessage());
//            System.exit(1);
//        }
//    }

//    public static void cleanUp(S3Client s3Client, String bucketName, String keyName) {
//        System.out.println("Cleaning up...");
//        try {
//            System.out.println("Deleting object: " + keyName);
//            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder().bucket(bucketName).key(keyName).build();
//            s3Client.deleteObject(deleteObjectRequest);
//            System.out.println(keyName + " has been deleted.");
//            System.out.println("Deleting bucket: " + bucketName);
//            DeleteBucketRequest deleteBucketRequest = DeleteBucketRequest.builder().bucket(bucketName).build();
//            s3Client.deleteBucket(deleteBucketRequest);
//            System.out.println(bucketName + " has been deleted.");
//            System.out.printf("%n");
//        } catch (S3Exception e) {
//            System.err.println(e.awsErrorDetails().errorMessage());
//            System.exit(1);
//        }
//        System.out.println("Cleanup complete");
//        System.out.printf("%n");
//    }
}