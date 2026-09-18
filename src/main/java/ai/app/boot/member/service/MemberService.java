package ai.app.boot.member.service;

import ai.app.boot.member.dto.MemberSearchCondition;
import ai.app.boot.member.dto.MemberTeamDto;
import ai.app.boot.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;

    public Page<MemberTeamDto> searchMembers(MemberSearchCondition condition, Pageable pageable) {
        return memberRepository.searchPage(condition, pageable);
    }
}
