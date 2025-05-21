package com.conkiri.domain.ticketing.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QResult is a Querydsl query type for Result
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QResult extends EntityPathBase<Result> {

    private static final long serialVersionUID = 14904362L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QResult result = new QResult("result");

    public final NumberPath<Long> processingTime = createNumber("processingTime", Long.class);

    public final DateTimePath<java.time.LocalDateTime> reserveTime = createDateTime("reserveTime", java.time.LocalDateTime.class);

    public final NumberPath<Long> ResultId = createNumber("ResultId", Long.class);

    public final StringPath seat = createString("seat");

    public final StringPath section = createString("section");

    public final NumberPath<Long> ticketRank = createNumber("ticketRank", Long.class);

    public final com.conkiri.domain.user.entity.QUser user;

    public QResult(String variable) {
        this(Result.class, forVariable(variable), INITS);
    }

    public QResult(Path<? extends Result> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QResult(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QResult(PathMetadata metadata, PathInits inits) {
        this(Result.class, metadata, inits);
    }

    public QResult(Class<? extends Result> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.user = inits.isInitialized("user") ? new com.conkiri.domain.user.entity.QUser(forProperty("user")) : null;
    }

}

