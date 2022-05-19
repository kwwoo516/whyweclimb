package com.whyweclimb.backend.entity;

import lombok.*;

import java.util.Collection;

import javax.persistence.*;

import org.hibernate.annotations.ColumnDefault;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "tb_user")
public class User implements UserDetails{
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userSeq;
    @Column(length = 100)
    private String userId;
    @Column
    private String userPassword;
    @Column
    private Integer backgroundSound;
    @Column
    private Integer effectSound;
	@Column
	@ColumnDefault("0")
	private Integer maxLevel;
	@Column
	@ColumnDefault("1")
	private Integer skinSeq;

	@Override
	public boolean equals(Object obj) {
		if (obj instanceof User) {
			return this.userId.equals(((User)obj).getUserId());
		}
		return false;
	}
	
	@Override
	public int hashCode() {
		return this.userId.hashCode();
	}
	
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		// TODO Auto-generated method stub
		return null;
	}
	@Override
	public String getPassword() {
		// TODO Auto-generated method stub
		return this.userPassword;
	}
	@Override
	public String getUsername() {
		// TODO Auto-generated method stub
		return this.userId;
	}
	@Override
	public boolean isAccountNonExpired() {
		// TODO Auto-generated method stub
		return false;
	}
	@Override
	public boolean isAccountNonLocked() {
		// TODO Auto-generated method stub
		return false;
	}
	@Override
	public boolean isCredentialsNonExpired() {
		// TODO Auto-generated method stub
		return false;
	}
	@Override
	public boolean isEnabled() {
		// TODO Auto-generated method stub
		return false;
	}
    
}
