package com.whyweclimb.backend.entity;

import lombok.*;

import java.time.LocalDate;

import javax.persistence.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "tb_simultaneous_connection")
public class SimultaneousConnection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer simultaneousConnectionSeq;
    @Column
    private Integer connectionCount;
    @Column
    private LocalDate connectionDate;
}
