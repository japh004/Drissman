package com.drissman.api.controller;

import com.drissman.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageStorageService storageService;

    @PostMapping("/upload")
    public Mono<ResponseEntity<Map<String, String>>> upload(@RequestPart("file") Mono<FilePart> filePartMono) {
        return filePartMono
                .flatMap(storageService::save)
                .map(filename -> ResponseEntity.ok(Map.of("url", "/api/images/" + filename)));
    }

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        Resource file = storageService.load(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .contentType(MediaType.IMAGE_JPEG) // You might want to detect this dynamically
                .body(file);
    }
}
