// global.d.ts
export {};

declare global {
  interface Window {
    kakao: any;
  }

  // 선택적으로 kakao 네임스페이스도 선언할 수 있습니다
  namespace kakao.maps {
    class Map {
      constructor(container: HTMLElement, options: any);
      setCenter(position: any): void;
      setLevel(level: number): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
    }

    class Marker {
      constructor(options: any);
      setMap(map: Map | null): void;
    }

    class CustomOverlay {
      constructor(options: any);
      setMap(map: Map | null): void;
    }

    namespace event {
      function addListener(
        target: any,
        type: string,
        callback: () => void
      ): void;
    }
  }
}
