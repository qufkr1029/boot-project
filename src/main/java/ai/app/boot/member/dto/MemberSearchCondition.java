package ai.app.boot.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MemberSearchCondition {

    private String memberName; // 회원 이름 조건
    private String teamName;   // 소속 팀 이름 조건
    private Integer ageGoe;    // 나이 이상 (age >=)
    private Integer ageLoe;    // 나이 이하 (age <=)
}
