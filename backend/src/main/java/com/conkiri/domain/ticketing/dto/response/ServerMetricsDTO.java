package com.conkiri.domain.ticketing.dto.response;


public record ServerMetricsDTO(double cpuLoad, double memoryLoad, double totalLoad) {

	public static ServerMetricsDTO of(double cpuLoad, double memoryLoad) {
		double totalLoad = calculateTotalLoad(cpuLoad, memoryLoad);
		return new ServerMetricsDTO(cpuLoad, memoryLoad, totalLoad);
	}

	private static double calculateTotalLoad(double cpuLoad, double memoryLoad) {
		return (cpuLoad * 0.6) + (memoryLoad * 0.4);  // CPU 60%, Memory 40%
	}
}
