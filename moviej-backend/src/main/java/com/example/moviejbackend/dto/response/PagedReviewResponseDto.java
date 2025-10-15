package com.example.moviejbackend.dto.response;

import java.util.List;

public class PagedReviewResponseDto {
    private List<ReviewResponseDto> content;  // 리뷰 리스트
    private int page;                        // 현재 페이지 번호
    private int size;                        // 페이지 크기
    private long totalElements;              // 전체 요소 수
    private int totalPages;                  // 전체 페이지 수
    private boolean first;                   // 첫 번째 페이지 여부
    private boolean last;                    // 마지막 페이지 여부

    // 생성자
    public PagedReviewResponseDto(List<ReviewResponseDto> content, int page, int size, 
                                  long totalElements, int totalPages, boolean first, boolean last) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.first = first;
        this.last = last;
    }

    // Getters and Setters
    public List<ReviewResponseDto> getContent() { return content; }
    public void setContent(List<ReviewResponseDto> content) { this.content = content; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    public boolean isFirst() { return first; }
    public void setFirst(boolean first) { this.first = first; }
    public boolean isLast() { return last; }
    public void setLast(boolean last) { this.last = last; }
}