# 이미지 업로드

White Editor의 이미지 업로드 기능을 설정하는 방법을 안내합니다.

## 기본 동작

이미지 업로드는 다음 우선순위로 처리됩니다:

1. **serverAPI** - 서버 API 객체가 있으면 우선 사용
2. **upload** - 커스텀 업로드 함수 사용
3. **기본값** - 개발 환경에서는 로컬 URL 생성 (프로덕션에서는 서버 설정 필요)

## 파일 제한 설정

### 기본 설정

```tsx
<WhiteEditor
  toolbarProps={{
    image: {
      maxSize: 1024 * 1024 * 10,
      accept: 'image/*',
    },
  }}
/>
```

### 특정 이미지 타입만 허용

```tsx
<WhiteEditor
  toolbarProps={{
    image: {
      accept: 'image/png, image/jpeg',
      maxSize: 1024 * 1024 * 5,
    },
  }}
/>
```

## 서버 API 사용 (권장)

완전한 이미지 관리를 위한 서버 API를 설정합니다.

```tsx
<WhiteEditor
  toolbarProps={{
    image: {
      serverAPI: {
        upload: async (file: File) => {
          const formData = new FormData();
          formData.append('image', file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();

          return {
            success: true,
            url: data.url,
            id: data.id,
          };
        },
        delete: async (id: string) => {
          await fetch(`/api/images/${id}`, {
            method: 'DELETE',
          });
          return true;
        },
      },
      onSuccess: (url) => {
        console.log('업로드 성공:', url);
      },
      onError: (error) => {
        console.error('업로드 실패:', error);
      },
    },
  }}
/>
```

## 간단한 업로드 함수

delete 기능이 필요 없는 경우 간단한 함수를 사용할 수 있습니다.

```tsx
<WhiteEditor
  toolbarProps={{
    image: {
      upload: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const { url } = await response.json();
        return url;
      },
    },
  }}
/>
```

## 클라우드 스토리지 연동

### AWS S3 예제

```tsx
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

<WhiteEditor
  toolbarProps={{
    image: {
      upload: async (file: File) => {
        const key = `images/${Date.now()}-${file.name}`;

        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          Body: file,
          ContentType: file.type,
        };

        const result = await s3.upload(params).promise();
        return result.Location;
      },
    },
  }}
/>;
```

### Firebase Storage 예제

```tsx
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

<WhiteEditor
  toolbarProps={{
    image: {
      upload: async (file: File) => {
        const storageRef = ref(storage, `images/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        return url;
      },
    },
  }}
/>;
```

## 이미지 편집

업로드된 이미지는 TUI Image Editor를 통해 편집할 수 있습니다.

- **Crop** - 이미지 자르기
- **Draw** - 선 그리기
- **Shape** - 도형 추가
- **Text** - 텍스트 추가
- **Filter** - 필터 적용

이미지를 클릭하고 편집 버튼을 눌러 편집 모드로 진입합니다.

## 이미지 리사이즈

에디터 내에서 이미지 크기를 조절할 수 있습니다.

- 이미지를 선택하면 모서리에 리사이즈 핸들이 표시됩니다
- 드래그하여 크기를 조절할 수 있습니다
- 비율을 유지하며 크기가 조절됩니다

## 이미지 캡션

이미지 하단에 캡션을 추가할 수 있습니다.

1. 이미지를 클릭합니다
2. 하단의 캡션 입력란에 텍스트를 입력합니다

## 콜백 함수

### 성공 콜백

```tsx
<WhiteEditor
  toolbarProps={{
    image: {
      upload: uploadFunction,
      onSuccess: (url) => {
        console.log('이미지 업로드 성공:', url);
        toast.success('이미지가 업로드되었습니다.');
      },
    },
  }}
/>
```

### 에러 콜백

```tsx
<WhiteEditor
  toolbarProps={{
    image: {
      upload: uploadFunction,
      onError: (error) => {
        console.error('업로드 실패:', error);
        toast.error('이미지 업로드에 실패했습니다.');
      },
    },
  }}
/>
```

## 실전 예제

### 완전한 이미지 업로드 시스템

```tsx
import { WhiteEditor } from '@0ffen/white-editor';
import { toast } from 'sonner';

function MyEditor() {
  return (
    <WhiteEditor
      toolbarProps={{
        image: {
          maxSize: 1024 * 1024 * 10,
          accept: 'image/jpeg, image/png, image/gif',
          serverAPI: {
            upload: async (file: File) => {
              try {
                const formData = new FormData();
                formData.append('image', file);

                const response = await fetch('/api/images/upload', {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: formData,
                });

                if (!response.ok) {
                  throw new Error('업로드 실패');
                }

                const data = await response.json();

                return {
                  success: true,
                  url: data.url,
                  id: data.id,
                };
              } catch (error) {
                return {
                  success: false,
                  error: error.message,
                };
              }
            },
            delete: async (id: string) => {
              try {
                await fetch(`/api/images/${id}`, {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                return true;
              } catch (error) {
                console.error('삭제 실패:', error);
                return false;
              }
            },
          },
          onSuccess: (url) => {
            toast.success('이미지가 업로드되었습니다.');
          },
          onError: (error) => {
            toast.error(`업로드 실패: ${error}`);
          },
        },
      }}
    />
  );
}
```

## 다음 단계

- [에디터 제어](/guide/editor-control) - 에디터를 프로그래밍 방식으로 제어합니다.
- [유틸리티](/guide/utilities) - 유틸리티 함수를 사용합니다.
- [API 레퍼런스](/api/editor-props) - 모든 Props를 확인합니다.
