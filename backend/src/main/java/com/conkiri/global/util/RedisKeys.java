package com.conkiri.global.util;

public class RedisKeys {

	private RedisKeys() {}

	public static final String PREFIX = "ticketing:";
	public static final String SEATS = PREFIX + "seats:";
	public static final String HISTORY = PREFIX + "history:";
	public static final String SEAT_LOCK = PREFIX + "seat:lock:";
	public static final String QUEUE = PREFIX + "queue";
	public static final String TIME = PREFIX + "time";
	public static final String SESSION_MAP = PREFIX + "session:map";

	public static String getSectionKey(String section) {
		return SEATS + section;
	}

	public static String getSeatHistoryKey(String section, String seat) {
		return HISTORY + section + ":" + seat;
	}

	public static String getUserHistoryKey(Long userId) {
		return HISTORY + "user:" + userId;  // "ticketing:history:user:1"
	}

	public static String getSeatLockKey(String section, String seat) {
		return SEAT_LOCK + section + ":" + seat;
	}
}