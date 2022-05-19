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
@Table(name = "tb_cumulative_connection")
public class CumulativeConnection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cumulativeConnectionSeq;
    @Column
    private Integer connectionCount;
    @Column
    private LocalDate connectionDate;
}
