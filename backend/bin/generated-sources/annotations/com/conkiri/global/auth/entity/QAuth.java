package com.conkiri.global.auth.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QAuth is a Querydsl query type for Auth
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QAuth extends EntityPathBase<Auth> {

    private static final long serialVersionUID = 2061970388L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QAuth auth = new QAuth("auth");

    public final NumberPath<Long> authId = createNumber("authId", Long.class);

    public final DateTimePath<java.time.LocalDateTime> expiryDate = createDateTime("expiryDate", java.time.LocalDateTime.class);

    public final StringPath provider = createString("provider");

    public final StringPath providerId = createString("providerId");

    public final StringPath refreshToken = createString("refreshToken");

    public final com.conkiri.domain.user.entity.QUser user;

    public QAuth(String variable) {
        this(Auth.class, forVariable(variable), INITS);
    }

    public QAuth(Path<? extends Auth> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QAuth(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QAuth(PathMetadata metadata, PathInits inits) {
        this(Auth.class, metadata, inits);
    }

    public QAuth(Class<? extends Auth> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.user = inits.isInitialized("user") ? new com.conkiri.domain.user.entity.QUser(forProperty("user")) : null;
    }

}

