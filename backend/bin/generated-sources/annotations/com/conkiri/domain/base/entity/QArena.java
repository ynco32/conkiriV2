package com.conkiri.domain.base.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QArena is a Querydsl query type for Arena
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QArena extends EntityPathBase<Arena> {

    private static final long serialVersionUID = 1025222323L;

    public static final QArena arena = new QArena("arena");

    public final StringPath address = createString("address");

    public final StringPath arenaEngName = createString("arenaEngName");

    public final NumberPath<Long> arenaId = createNumber("arenaId", Long.class);

    public final StringPath arenaName = createString("arenaName");

    public final NumberPath<Double> latitude = createNumber("latitude", Double.class);

    public final NumberPath<Double> longitude = createNumber("longitude", Double.class);

    public final StringPath photoUrl = createString("photoUrl");

    public QArena(String variable) {
        super(Arena.class, forVariable(variable));
    }

    public QArena(Path<? extends Arena> path) {
        super(path.getType(), path.getMetadata());
    }

    public QArena(PathMetadata metadata) {
        super(Arena.class, metadata);
    }

}

