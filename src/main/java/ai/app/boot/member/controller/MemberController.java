package ai.app.boot.member.controller;

import ai.app.boot.member.dto.MemberSearchCondition;
import ai.app.boot.member.dto.MemberTeamDto;
import ai.app.boot.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/members")
public class MemberController {

    private final MemberService memberService;

    @GetMapping
    public ResponseEntity<Page<MemberTeamDto>> searchMembers(
            MemberSearchCondition condition,
            Pageable pageable
    ) {
        Page<MemberTeamDto> result = memberService.searchMembers(condition, pageable);
        return ResponseEntity.ok(result);
    }
}
