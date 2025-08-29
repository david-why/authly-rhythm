export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const DEFAULT_ASSETS = {
  portrait:
    'https://hc-cdn.hel1.your-objectstorage.com/s/v3/697c6c09bc112e413849eaaa05758e98c8c1e685_gemini_generated_image_g5vvdzg5vvdzg5vv.png',
  jump: 'https://hc-cdn.hel1.your-objectstorage.com/s/v3/e8907dfe3053b9c13ecf9eb43787560e2cf67a50_gemini_generated_image_7usxgr7usxgr7usx.png',
  active1:
    'https://hc-cdn.hel1.your-objectstorage.com/s/v3/d605d694194de4f3f65632f9d553aacc53d628ec_gemini_generated_image_q67aprq67aprq67a.png',
  active2:
    'https://hc-cdn.hel1.your-objectstorage.com/s/v3/9963a567df884bc098a0eca93ab9e2e775e7d0d1_gemini_generated_image_usfx79usfx79usfx.png',
  happy:
    'https://hc-cdn.hel1.your-objectstorage.com/s/v3/d33d937e4aef538f39e74086eb80881bb479eb5c_gemini_generated_image_9j26gh9j26gh9j26.png',
} as const

export const ASSETS: typeof DEFAULT_ASSETS = import.meta.env.VITE_ASSETS
  ? JSON.parse(import.meta.env.VITE_ASSETS)
  : DEFAULT_ASSETS
