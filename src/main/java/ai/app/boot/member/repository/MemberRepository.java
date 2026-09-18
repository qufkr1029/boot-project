package ai.app.boot.member.repository;

import ai.app.boot.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MemberRepository extends JpaRepository<Member, Long>, MemberRepositoryCustom {

    List<Member> findByName(String name);

    List<Member> findByAgeGreaterThanEqual(int age);

    // 🔥 패치 조인: 회원과 연관된 팀을 한 번의 JOIN 쿼리로 함께 가져옴
    @Query("SELECT m FROM Member m JOIN FETCH m.team")
    List<Member> findAllWithTeam();
}
