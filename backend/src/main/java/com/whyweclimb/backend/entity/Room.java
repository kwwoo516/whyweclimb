package com.whyweclimb.backend.entity;

import lombok.*;

import javax.persistence.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "tb_room")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer roomSeq;
    @Column
    private String roomCode;
    @Column
    private Boolean roomPrivate;
    @Column
    private Boolean roomInterference;
    @Column
    private Integer roomMaxNum;
    @Column
    private Boolean roomStart;
}
