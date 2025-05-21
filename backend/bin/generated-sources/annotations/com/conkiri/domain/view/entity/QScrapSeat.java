package com.conkiri.domain.view.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QScrapSeat is a Querydsl query type for ScrapSeat
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QScrapSeat extends EntityPathBase<ScrapSeat> {

    private static final long serialVersionUID = 566253006L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QScrapSeat scrapSeat = new QScrapSeat("scrapSeat");

    public final NumberPath<Long> scrapSeatId = createNumber("scrapSeatId", Long.class);

    public final com.conkiri.domain.base.entity.QSeat seat;

    public final EnumPath<com.conkiri.domain.base.entity.StageType> stageType = createEnum("stageType", com.conkiri.domain.base.entity.StageType.class);

    public final com.conkiri.domain.user.entity.QUser user;

    public QScrapSeat(String variable) {
        this(ScrapSeat.class, forVariable(variable), INITS);
    }

    public QScrapSeat(Path<? extends ScrapSeat> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QScrapSeat(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QScrapSeat(PathMetadata metadata, PathInits inits) {
        this(ScrapSeat.class, metadata, inits);
    }

    public QScrapSeat(Class<? extends ScrapSeat> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.seat = inits.isInitialized("seat") ? new com.conkiri.domain.base.entity.QSeat(forProperty("seat"), inits.get("seat")) : null;
        this.user = inits.isInitialized("user") ? new com.conkiri.domain.user.entity.QUser(forProperty("user")) : null;
    }

}

