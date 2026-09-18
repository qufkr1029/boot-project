package ai.app.boot.member.repository;

import ai.app.boot.member.domain.Member;
import ai.app.boot.member.dto.MemberSearchCondition;
import ai.app.boot.member.dto.MemberTeamDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MemberRepositoryCustom {
    List<Member> search(MemberSearchCondition condition);
    List<MemberTeamDto> searchDto(MemberSearchCondition condition);
    Page<MemberTeamDto> searchPage(MemberSearchCondition condition, Pageable pageable);
}
