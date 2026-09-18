package ai.app.boot.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class MemberTeamDto {

    private Long memberId;
    private String memberName;
    private int age;
    private String teamName;
}
