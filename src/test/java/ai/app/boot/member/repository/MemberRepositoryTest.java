package ai.app.boot.member.repository;

import ai.app.boot.member.domain.Member;
import ai.app.boot.member.domain.Team;
import ai.app.boot.member.dto.MemberSearchCondition;
import ai.app.boot.member.dto.MemberTeamDto;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class MemberRepositoryTest {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private EntityManager em;

    @Test
    @DisplayName("회원 저장 및 조회 테스트")
    void saveAndFind() {
        // given
        Member member = Member.builder().name("홍길동").age(20).build();

        // when
        Member savedMember = memberRepository.save(member);

        // then
        Member findMember = memberRepository.findById(savedMember.getId())
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        assertThat(findMember.getId()).isEqualTo(savedMember.getId());
        assertThat(findMember.getName()).isEqualTo("홍길동");
        assertThat(findMember.getAge()).isEqualTo(20);
    }

    @Test
    @DisplayName("변경 감지(Dirty Checking)를 통한 회원 수정")
    void updateByDirtyChecking() {
        // given
        Member member = Member.builder().name("이순신").age(30).build();
        Member savedMember = memberRepository.save(member);

        // when: update 쿼리나 save() 재호출 없이 객체 값만 변경
        savedMember.changeName("충무공 이순신");
        savedMember.changeAge(40);

        // 🔥 1. 쓰기 지연 저장소의 UPDATE SQL을 DB로 즉시 전송
        em.flush();
        // 🔥 2. 1차 캐시(메모리)를 완전히 비워, 다음 조회가 DB에서 일어나도록 강제
        em.clear();

        // then: 1차 캐시가 비워졌으므로 진짜 DB에 SELECT 쿼리를 날려서 가져옴
        Member findMember = memberRepository.findById(savedMember.getId()).orElseThrow();
        assertThat(findMember.getName()).isEqualTo("충무공 이순신");
        assertThat(findMember.getAge()).isEqualTo(40);
    }

    @Test
    @DisplayName("쿼리 메서드 동작 확인 (이름 검색 및 나이 조건 검색)")
    void queryMethods() {
        // given
        memberRepository.save(Member.builder().name("김철수").age(25).build());
        memberRepository.save(Member.builder().name("이영희").age(30).build());
        memberRepository.save(Member.builder().name("박민수").age(35).build());

        // when
        List<Member> byName = memberRepository.findByName("김철수");
        List<Member> byAge = memberRepository.findByAgeGreaterThanEqual(30);

        // then
        assertThat(byName).hasSize(1);
        assertThat(byName.get(0).getName()).isEqualTo("김철수");

        assertThat(byAge).hasSize(2);
    }

    @Test
    @DisplayName("회원과 팀 연관관계 저장 및 객체 그래프 탐색 (N:1)")
    void memberWithTeamTest() {
        // 1. 팀 생성 및 저장
        Team team = Team.builder().name("개발팀").build();
        teamRepository.save(team);

        // 2. 회원을 생성할 때 팀 객체를 그대로 전달하여 저장
        Member member = Member.builder().name("홍길동").age(28).team(team).build();
        memberRepository.save(member);

        // 3. DB에 쿼리를 밀어내고 1차 캐시를 비움
        em.flush();
        em.clear();

        // 4. 회원 조회 후 소속 팀 이름 확인 (객체 그래프 탐색)
        Member findMember = memberRepository.findById(member.getId()).orElseThrow();

        // 지연 로딩(LAZY)이므로 getTeam().getName()을 호출하는 순간 팀 SELECT 쿼리가 나감!
        assertThat(findMember.getTeam().getName()).isEqualTo("개발팀");
    }

    @Test
    @DisplayName("N+1 문제 발생 확인 (지연 로딩으로 인한 추가 쿼리 폭탄)")
    void nPlusOneProblemTest() {
        // given: 3개의 팀과 각 팀에 속한 3명의 회원 저장
        Team teamA = teamRepository.save(Team.builder().name("팀A").build());
        Team teamB = teamRepository.save(Team.builder().name("팀B").build());
        Team teamC = teamRepository.save(Team.builder().name("팀C").build());

        memberRepository.save(Member.builder().name("회원1").age(20).team(teamA).build());
        memberRepository.save(Member.builder().name("회원2").age(25).team(teamB).build());
        memberRepository.save(Member.builder().name("회원3").age(30).team(teamC).build());

        em.flush();
        em.clear();

        System.out.println("====== [1. 회원 전체 조회 시작 (1번 쿼리)] ======");
        List<Member> members = memberRepository.findAll();
        System.out.println("====== [1. 회원 전체 조회 종료] ======");

        System.out.println("====== [2. 각 회원의 팀 이름 탐색 시작 (N번 쿼리 발생 지점)] ======");
        for (Member m : members) {
            // m.getTeam().getName() 호출할 때마다 팀 SELECT 쿼리가 1번씩 나감!
            System.out.println("회원 이름: " + m.getName() + ", 소속팀: " + m.getTeam().getName());
        }
        System.out.println("====== [2. 각 회원의 팀 이름 탐색 종료] ======");
    }

    @Test
    @DisplayName("Fetch Join을 통한 N+1 문제 해결 (단 1번의 JOIN 쿼리)")
    void fetchJoinSolveTest() {
        // given: 3개의 팀과 각 팀에 속한 3명의 회원 저장
        Team teamA = teamRepository.save(Team.builder().name("팀A").build());
        Team teamB = teamRepository.save(Team.builder().name("팀B").build());
        Team teamC = teamRepository.save(Team.builder().name("팀C").build());

        memberRepository.save(Member.builder().name("회원1").age(20).team(teamA).build());
        memberRepository.save(Member.builder().name("회원2").age(25).team(teamB).build());
        memberRepository.save(Member.builder().name("회원3").age(30).team(teamC).build());

        em.flush();
        em.clear();

        System.out.println("====== [1. Fetch Join 회원+팀 동시 조회 시작 (딱 1번 쿼리)] ======");
        List<Member> members = memberRepository.findAllWithTeam();
        System.out.println("====== [1. Fetch Join 회원+팀 동시 조회 종료] ======");

        System.out.println("====== [2. 각 회원의 팀 이름 탐색 시작 (추가 쿼리가 전혀 안 나감!)] ======");
        for (Member m : members) {
            // 이미 1번 쿼리에서 팀 데이터를 다 가져왔으므로 추가 쿼리가 0번 나감!
            System.out.println("회원 이름: " + m.getName() + ", 소속팀: " + m.getTeam().getName());
        }
        System.out.println("====== [2. 각 회원의 팀 이름 탐색 종료] ======");
    }

    @Test
    @DisplayName("1:N 컬렉션 조회 시 N+1 문제 확인")
    void collectionNPlusOneTest() {
        // given: 2개의 팀, 각 팀마다 회원 2명씩 저장
        Team teamA = teamRepository.save(Team.builder().name("팀A").build());
        Team teamB = teamRepository.save(Team.builder().name("팀B").build());

        memberRepository.save(Member.builder().name("팀A-회원1").age(20).team(teamA).build());
        memberRepository.save(Member.builder().name("팀A-회원2").age(22).team(teamA).build());
        memberRepository.save(Member.builder().name("팀B-회원1").age(30).team(teamB).build());
        memberRepository.save(Member.builder().name("팀B-회원2").age(32).team(teamB).build());

        em.flush();
        em.clear();

        System.out.println("====== [1. 팀 목록 전체 조회 (1번 쿼리)] ======");
        List<Team> teams = teamRepository.findAll();
        System.out.println("====== [1. 팀 목록 전체 조회 종료] ======");

        System.out.println("====== [2. 각 팀의 회원 컬렉션 조회 (N번 쿼리 발생 지점)] ======");
        for (Team team : teams) {
            System.out.println("팀 이름: " + team.getName() + ", 소속 회원 수: " + team.getMembers().size());
            for (Member member : team.getMembers()) {
                System.out.println("  -> 회원 이름: " + member.getName());
            }
        }
        System.out.println("====== [2. 각 팀의 회원 컬렉션 조회 종료] ======");
    }

    @Test
    @DisplayName("사용자 정의 리포지토리 - MemberRepository 하나로 save와 Querydsl searchDto 동시 호출")
    void customRepositoryTest() {
        // given: 팀 및 회원 저장 (JpaRepository 기본 save 기능)
        Team team = teamRepository.save(Team.builder().name("인프라팀").build());
        memberRepository.save(Member.builder().name("서버관리자").age(32).team(team).build());
        memberRepository.save(Member.builder().name("네트워크관리자").age(28).team(team).build());

        em.flush();
        em.clear();

        // when: MemberRepository 하나에서 Querydsl searchDto() 호출!
        MemberSearchCondition condition = new MemberSearchCondition();
        condition.setTeamName("인프라팀");
        condition.setAgeGoe(30);

        List<MemberTeamDto> result = memberRepository.searchDto(condition);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getMemberName()).isEqualTo("서버관리자");
        assertThat(result.get(0).getTeamName()).isEqualTo("인프라팀");

        System.out.println("조회된 DTO = " + result.get(0));
    }

    @Test
    @DisplayName("1:N 컬렉션 페이징과 배치 사이즈 동작 검증")
    void collectionPagingAndBatchSizeTest() {
        // given: 3개의 팀, 각 팀마다 회원 2명씩 저장 (총 6명)
        Team teamA = teamRepository.save(Team.builder().name("팀A").build());
        Team teamB = teamRepository.save(Team.builder().name("팀B").build());
        Team teamC = teamRepository.save(Team.builder().name("팀C").build());

        memberRepository.save(Member.builder().name("팀A-회원1").age(20).team(teamA).build());
        memberRepository.save(Member.builder().name("팀A-회원2").age(22).team(teamA).build());
        memberRepository.save(Member.builder().name("팀B-회원1").age(30).team(teamB).build());
        memberRepository.save(Member.builder().name("팀B-회원2").age(32).team(teamB).build());
        memberRepository.save(Member.builder().name("팀C-회원1").age(40).team(teamC).build());
        memberRepository.save(Member.builder().name("팀C-회원2").age(42).team(teamC).build());

        em.flush();
        em.clear();

        // when: 팀 페이징 조회 (0페이지, 2건)
        PageRequest pageRequest = PageRequest.of(0, 2);
        System.out.println("====== [1. 팀 페이징 조회 시작 (LIMIT 2 OFFSET 0 + COUNT 쿼리)] ======");
        Page<Team> teamPage = teamRepository.findAll(pageRequest);
        System.out.println("====== [1. 팀 페이징 조회 종료] ======");

        // then: 페이징 메타데이터 검증
        assertThat(teamPage.getContent()).hasSize(2);          // 현재 페이지 데이터 2개 (팀A, 팀B)
        assertThat(teamPage.getTotalElements()).isEqualTo(3);   // 전체 팀 개수 3개
        assertThat(teamPage.getTotalPages()).isEqualTo(2);      // 전체 페이지 수 2개
        assertThat(teamPage.getNumber()).isEqualTo(0);          // 현재 페이지 번호 0
        assertThat(teamPage.hasNext()).isTrue();                // 다음 페이지 존재 (팀C)

        // when 2: 각 팀의 회원 컬렉션 접근 (배치 사이즈 IN 쿼리 발생 지점)
        System.out.println("====== [2. 각 팀의 회원 컬렉션 접근 시작 (배치 사이즈 IN 쿼리 1번 실행)] ======");
        for (Team team : teamPage.getContent()) {
            System.out.println("팀 이름: " + team.getName() + ", 회원 수: " + team.getMembers().size());
            for (Member member : team.getMembers()) {
                System.out.println("  -> 회원: " + member.getName());
            }
        }
        System.out.println("====== [2. 각 팀의 회원 컬렉션 접근 종료] ======");
    }

    @Test
    @DisplayName("Querydsl 페이징 연동 및 Count 쿼리 최적화 검증")
    void searchPageTest() {
        // given: 팀 및 회원 데이터 저장
        Team teamA = teamRepository.save(Team.builder().name("개발팀").build());
        Team teamB = teamRepository.save(Team.builder().name("기획팀").build());

        memberRepository.save(Member.builder().name("김개발1").age(25).team(teamA).build());
        memberRepository.save(Member.builder().name("김개발2").age(26).team(teamA).build());
        memberRepository.save(Member.builder().name("김개발3").age(27).team(teamA).build());
        memberRepository.save(Member.builder().name("김개발4").age(28).team(teamA).build());
        memberRepository.save(Member.builder().name("김개발5").age(29).team(teamA).build());
        memberRepository.save(Member.builder().name("박기획1").age(30).team(teamB).build());

        em.flush();
        em.clear();

        // when: 개발팀 소속 회원 검색 (페이지당 2명씩, 0번째 페이지 조회)
        MemberSearchCondition condition = new MemberSearchCondition();
        condition.setTeamName("개발팀");

        PageRequest pageRequest = PageRequest.of(0, 2);
        System.out.println("====== [1. Querydsl searchPage 실행 (OFFSET 0, LIMIT 2)] ======");
        Page<MemberTeamDto> result = memberRepository.searchPage(condition, pageRequest);
        System.out.println("====== [1. Querydsl searchPage 종료] ======");

        // then: 페이징 메타데이터 검증
        assertThat(result.getContent()).hasSize(2);          // 1페이지에 2건
        assertThat(result.getTotalElements()).isEqualTo(5);   // 개발팀 총 5명
        assertThat(result.getTotalPages()).isEqualTo(3);      // 총 3페이지 (2+2+1)
        assertThat(result.getNumber()).isEqualTo(0);          // 0페이지
        assertThat(result.hasNext()).isTrue();                // 다음 페이지 있음

        System.out.println("====== 1페이지 내용 출력 ======");
        for (MemberTeamDto dto : result.getContent()) {
            System.out.println("dto = " + dto);
        }
    }

    @Test
    @DisplayName("Querydsl 동적 정렬(OrderSpecifier) 검증 - 나이 내림차순(DESC)")
    void searchPageSortTest() {
        // given: 팀 및 회원 데이터 저장
        Team team = teamRepository.save(Team.builder().name("데이터팀").build());

        memberRepository.save(Member.builder().name("막내").age(22).team(team).build());
        memberRepository.save(Member.builder().name("팀장").age(45).team(team).build());
        memberRepository.save(Member.builder().name("중간").age(33).team(team).build());

        em.flush();
        em.clear();

        // when: 데이터팀 회원 조회 + 나이 내림차순(DESC) 정렬 요청
        MemberSearchCondition condition = new MemberSearchCondition();
        condition.setTeamName("데이터팀");

        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "age"));
        Page<MemberTeamDto> result = memberRepository.searchPage(condition, pageRequest);

        // then: 나이가 많은 순서대로(45 -> 33 -> 22) 정렬되었는지 검증
        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent())
                .extracting("memberName")
                .containsExactly("팀장", "중간", "막내");
        assertThat(result.getContent())
                .extracting("age")
                .containsExactly(45, 33, 22);

        System.out.println("====== 정렬된 결과 출력 ======");
        for (MemberTeamDto dto : result.getContent()) {
            System.out.println("이름: " + dto.getMemberName() + ", 나이: " + dto.getAge());
        }
    }
}
