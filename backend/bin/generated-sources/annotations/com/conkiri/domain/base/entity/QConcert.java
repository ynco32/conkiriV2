package com.conkiri.domain.base.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QConcert is a Querydsl query type for Concert
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QConcert extends EntityPathBase<Concert> {

    private static final long serialVersionUID = -906714286L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QConcert concert = new QConcert("concert");

    public final QArena arena;

    public final StringPath artist = createString("artist");

    public final NumberPath<Long> concertId = createNumber("concertId", Long.class);

    public final StringPath concertName = createString("concertName");

    public final StringPath photoUrl = createString("photoUrl");

    public final DateTimePath<java.time.LocalDateTime> startTime = createDateTime("startTime", java.time.LocalDateTime.class);

    public QConcert(String variable) {
        this(Concert.class, forVariable(variable), INITS);
    }

    public QConcert(Path<? extends Concert> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QConcert(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QConcert(PathMetadata metadata, PathInits inits) {
        this(Concert.class, metadata, inits);
    }

    public QConcert(Class<? extends Concert> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.arena = inits.isInitialized("arena") ? new QArena(forProperty("arena")) : null;
    }

}

