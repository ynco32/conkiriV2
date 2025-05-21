package com.conkiri.domain.sharing.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QScrapSharing is a Querydsl query type for ScrapSharing
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QScrapSharing extends EntityPathBase<ScrapSharing> {

    private static final long serialVersionUID = -828983010L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QScrapSharing scrapSharing = new QScrapSharing("scrapSharing");

    public final NumberPath<Long> scrapSharingId = createNumber("scrapSharingId", Long.class);

    public final QSharing sharing;

    public final com.conkiri.domain.user.entity.QUser user;

    public QScrapSharing(String variable) {
        this(ScrapSharing.class, forVariable(variable), INITS);
    }

    public QScrapSharing(Path<? extends ScrapSharing> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QScrapSharing(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QScrapSharing(PathMetadata metadata, PathInits inits) {
        this(ScrapSharing.class, metadata, inits);
    }

    public QScrapSharing(Class<? extends ScrapSharing> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.sharing = inits.isInitialized("sharing") ? new QSharing(forProperty("sharing"), inits.get("sharing")) : null;
        this.user = inits.isInitialized("user") ? new com.conkiri.domain.user.entity.QUser(forProperty("user")) : null;
    }

}

