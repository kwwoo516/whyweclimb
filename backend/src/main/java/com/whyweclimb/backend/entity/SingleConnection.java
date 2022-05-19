package com.whyweclimb.backend.entity;

import lombok.*;

import java.time.LocalDate;

import javax.persistence.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "tb_single_connection")
public class SingleConnection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer singleConnectionSeq;
    @Column
    private Integer connectionCount;
    @Column
    private LocalDate connectionDate;
}
