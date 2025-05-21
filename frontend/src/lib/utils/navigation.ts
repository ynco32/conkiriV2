// 라우터 옵션 타입 정의
type RouterOptions = {
  scroll?: boolean;
};

// 가능한 내비게이션 동작 타입 정의
type NavigationAction = {
  type: 'push' | 'history-back' | 'replace';
  path?: string;
  options?: RouterOptions;
};

/**
 * 현재 경로와 이전 경로를 기반으로 뒤로가기 동작을 결정합니다.
 * @param pathname 현재 경로
 * @param previousPath 이전 경로
 * @returns 수행할 내비게이션 동작
 */
export function determineBackNavigation(
  pathname: string,
  previousPath: string
): NavigationAction {
  const pathSegments = pathname.split('/').filter(Boolean);

  // ticketing 페이지 처리
  if (pathSegments[0] === 'ticketing') {
    return handleTicketingBack(pathSegments);
  }

  // sight 경로 처리
  if (pathSegments[0] === 'sight') {
    return handleSightBack(pathSegments, previousPath);
  }

  // place 경로 처리
  if (pathSegments[0] === 'place') {
    return handlePlaceBack(pathSegments, previousPath);
  }

  // 루트 레벨 페이지 처리
  if (
    pathSegments.length === 1 &&
    [
      'sight',
      'sharing',
      'mypage',
      'ticketing',
      'congestion',
      'minigame',
    ].includes(pathSegments[0])
  ) {
    return { type: 'push', path: '/main' };
  }

  if (['artists', 'concerts'].includes(pathSegments[0])) {
    return { type: 'replace', path: '/mypage' };
  }

  // 그 외 경로에서는 한 단계 위로 이동
  if (pathSegments.length > 1) {
    const upperPath = '/' + pathSegments.slice(0, -1).join('/');
    return { type: 'push', path: upperPath };
  }

  // 기본 동작은 브라우저 히스토리 뒤로가기
  return { type: 'history-back' };
}

/**
 * ticketing 경로에서의 뒤로가기 동작 처리
 */
function handleTicketingBack(pathSegments: string[]): NavigationAction {
  // /ticketing 루트 경로에서는 메인으로
  if (pathSegments.length === 1) {
    return { type: 'push', path: '/main' };
  }

  // /ticketing/real 에서 뒤로가기 시 메인으로 이동
  if (
    pathSegments.length === 2 &&
    pathSegments[0] === 'ticketing' &&
    pathSegments[1] === 'real'
  ) {
    return { type: 'push', path: '/main' };
  }

  // /ticketing/real/areas/[areaId] 경로에서는 areaSelect로 이동
  if (
    pathSegments.length >= 4 &&
    pathSegments[1] === 'real' &&
    pathSegments[2] === 'areas' &&
    pathSegments[3] !== 'areaSelect'
  ) {
    return { type: 'push', path: '/ticketing/real/areas/areaSelect' };
  }

  // /ticketing/real/areas/areaSelect 경로에서는 /real로 이동
  if (
    pathSegments.length >= 4 &&
    pathSegments[1] === 'real' &&
    pathSegments[2] === 'areas' &&
    pathSegments[3] === 'areaSelect'
  ) {
    return { type: 'push', path: '/ticketing/real/' };
  }

  // /ticketing/*/real 하위 경로에서는 일반 뒤로가기 실행
  if (pathSegments.length >= 3 && pathSegments[2] === 'real') {
    return { type: 'history-back' };
  }

  // 그 외 ticketing 하위 경로에서는 상위 경로로
  const upperPath = '/' + pathSegments.slice(0, -1).join('/');
  return { type: 'push', path: upperPath };
}

/**
 * sight 경로에서의 뒤로가기 동작 처리
 */
function handleSightBack(
  pathSegments: string[],
  previousPath: string
): NavigationAction {
  // 리뷰 작성 페이지 처리
  if (pathSegments[1] === 'reviews') {
    // /sight/reviews/write
    if (pathSegments[2] === 'write') {
      // /mypage에서 작성으로 왔다면 다시 마이페이지로
      if (previousPath === '/mypage') {
        return { type: 'push', path: '/mypage' };
      }

      // /sight 내부에서 이동했으면 이전 경로로
      if (
        previousPath.startsWith('/sight/') &&
        !previousPath.includes('/reviews/')
      ) {
        return { type: 'push', path: previousPath };
      }

      // 그 외에는 시야 목록으로
      return { type: 'push', path: '/sight' };
    }

    // /sight/reviews/edit
    if (pathSegments[2] === 'edit') {
      const detailId = pathSegments[3]; // /sight/reviews/edit/[id]
      const reviewDetailPath = `/sight/reviews/${detailId}`;

      // /sight/reviews/[id] → edit → 뒤로가기 시 다시 상세
      if (previousPath === reviewDetailPath) {
        return { type: 'push', path: reviewDetailPath };
      }

      // 이전 경로가 마이페이지였다면 상세 → 마이페이지 흐름 유지
      if (previousPath === '/mypage') {
        return { type: 'push', path: '/sight/reviews/' + detailId };
      }

      return { type: 'push', path: '/sight' };
    }

    // /sight/reviews/[id] → 이전 페이지로 (조건 1)
    if (
      pathSegments.length === 3 &&
      !['write', 'edit'].includes(pathSegments[2])
    ) {
      return { type: 'push', path: previousPath };
    }

    return { type: 'push', path: '/sight' };
  }

  // 기본적으로는 한 단계 위로 이동
  if (pathSegments.length > 1) {
    const upperPath = '/' + pathSegments.slice(0, -1).join('/');
    return { type: 'push', path: upperPath };
  }

  return { type: 'push', path: '/main' };
}

/**
 * place 경로에서의 뒤로가기 동작 처리
 */
function handlePlaceBack(
  pathSegments: string[],
  previousPath: string
): NavigationAction {
  // place 상세페이지에서의 뒤로가기 처리
  if (pathSegments.length >= 2) {
    // 상세페이지에서 공연장 목록 페이지로 이동
    return { type: 'push', path: `/place` };
  }

  // 루트 경로에서는 메인으로
  return { type: 'push', path: '/main' };
}
