package com.conkiri.domain.sharing.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QSharing is a Querydsl query type for Sharing
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QSharing extends EntityPathBase<Sharing> {

    private static final long serialVersionUID = -139791447L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QSharing sharing = new QSharing("sharing");

    public final com.conkiri.global.common.QBaseTime _super = new com.conkiri.global.common.QBaseTime(this);

    public final com.conkiri.domain.base.entity.QConcert concert;

    public final StringPath content = createString("content");

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final NumberPath<Double> latitude = createNumber("latitude", Double.class);

    public final NumberPath<Double> longitude = createNumber("longitude", Double.class);

    public final StringPath photoUrl = createString("photoUrl");

    public final NumberPath<Long> sharingId = createNumber("sharingId", Long.class);

    public final DateTimePath<java.time.LocalDateTime> startTime = createDateTime("startTime", java.time.LocalDateTime.class);

    public final EnumPath<Status> status = createEnum("status", Status.class);

    public final StringPath title = createString("title");

    public final com.conkiri.domain.user.entity.QUser user;

    public QSharing(String variable) {
        this(Sharing.class, forVariable(variable), INITS);
    }

    public QSharing(Path<? extends Sharing> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QSharing(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QSharing(PathMetadata metadata, PathInits inits) {
        this(Sharing.class, metadata, inits);
    }

    public QSharing(Class<? extends Sharing> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.concert = inits.isInitialized("concert") ? new com.conkiri.domain.base.entity.QConcert(forProperty("concert"), inits.get("concert")) : null;
        this.user = inits.isInitialized("user") ? new com.conkiri.domain.user.entity.QUser(forProperty("user")) : null;
    }

}

