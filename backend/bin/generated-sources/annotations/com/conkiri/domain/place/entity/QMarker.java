package com.conkiri.domain.place.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QMarker is a Querydsl query type for Marker
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QMarker extends EntityPathBase<Marker> {

    private static final long serialVersionUID = 568566584L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QMarker marker = new QMarker("marker");

    public final com.conkiri.domain.base.entity.QArena arena;

    public final EnumPath<Category> category = createEnum("category", Category.class);

    public final StringPath detail = createString("detail");

    public final NumberPath<Double> latitude = createNumber("latitude", Double.class);

    public final NumberPath<Double> longitude = createNumber("longitude", Double.class);

    public final NumberPath<Long> markerId = createNumber("markerId", Long.class);

    public QMarker(String variable) {
        this(Marker.class, forVariable(variable), INITS);
    }

    public QMarker(Path<? extends Marker> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QMarker(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QMarker(PathMetadata metadata, PathInits inits) {
        this(Marker.class, metadata, inits);
    }

    public QMarker(Class<? extends Marker> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.arena = inits.isInitialized("arena") ? new com.conkiri.domain.base.entity.QArena(forProperty("arena")) : null;
    }

}

