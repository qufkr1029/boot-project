package ai.app.boot.member.repository;

import ai.app.boot.member.domain.Member;
import ai.app.boot.member.domain.Team;
import ai.app.boot.member.dto.MemberSearchCondition;
import ai.app.boot.member.dto.MemberTeamDto;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class MemberQueryRepositoryTest {

    @Autowired
    private MemberQueryRepository memberQueryRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private EntityManager em;

    @BeforeEach
    void setUp() {
        Team teamA = teamRepository.save(Team.builder().name("개발팀").build());
        Team teamB = teamRepository.save(Team.builder().name("기획팀").build());

        memberRepository.save(Member.builder().name("김개발").age(25).team(teamA).build());
        memberRepository.save(Member.builder().name("이개발").age(35).team(teamA).build());
        memberRepository.save(Member.builder().name("박기획").age(30).team(teamB).build());
        memberRepository.save(Member.builder().name("최기획").age(40).team(teamB).build());

        em.flush();
        em.clear();
    }

    @Test
    @DisplayName("Querydsl 동적 쿼리 - 팀 이름으로만 검색")
    void searchByTeamName() {
        MemberSearchCondition condition = new MemberSearchCondition();
        condition.setTeamName("개발팀");

        List<Member> result = memberQueryRepository.search(condition);

        assertThat(result).hasSize(2);
        assertThat(result).extracting("name").containsExactly("김개발", "이개발");
    }

    @Test
    @DisplayName("Querydsl 동적 쿼리 - 나이 조건으로만 검색 (30세 이상 35세 이하)")
    void searchByAgeRange() {
        MemberSearchCondition condition = new MemberSearchCondition();
        condition.setAgeGoe(30);
        condition.setAgeLoe(35);

        List<Member> result = memberQueryRepository.search(condition);

        assertThat(result).hasSize(2);
        assertThat(result).extracting("name").containsExactly("이개발", "박기획");
    }

    @Test
    @DisplayName("Querydsl 동적 쿼리 - 조건이 전혀 없을 때 (전체 조회)")
    void searchAllWhenConditionNull() {
        MemberSearchCondition condition = new MemberSearchCondition();

        List<Member> result = memberQueryRepository.search(condition);

        assertThat(result).hasSize(4);
    }

    @Test
    @DisplayName("Querydsl DTO 직접 조회 (Projections.constructor)")
    void searchDtoTest() {
        MemberSearchCondition condition = new MemberSearchCondition();
        condition.setTeamName("개발팀");
        condition.setAgeGoe(20);

        List<MemberTeamDto> result = memberQueryRepository.searchDto(condition);

        assertThat(result).hasSize(2);
        assertThat(result).extracting("memberName").containsExactly("김개발", "이개발");
        assertThat(result).extracting("teamName").containsOnly("개발팀");

        for (MemberTeamDto dto : result) {
            System.out.println("dto = " + dto);
        }
    }
}
