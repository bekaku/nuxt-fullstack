$ErrorActionPreference = "Stop"

$IMAGE_NAME = "nuxtui-web"
$TAG = "latest"
$BUILD_DIR = "build"
$TAR_PATH = Join-Path $BUILD_DIR "$IMAGE_NAME.tar"

# เคลียร์และสร้างโฟลเดอร์ build ใหม่
if (Test-Path $BUILD_DIR) {
    Remove-Item -Path $BUILD_DIR -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $BUILD_DIR | Out-Null

# ลบ image เดิมถ้ามีอยู่
docker image inspect "${IMAGE_NAME}:${TAG}" *> $null
if ($LASTEXITCODE -eq 0) {
    docker rmi "${IMAGE_NAME}:${TAG}"
}

# Build image
docker image build --no-cache -t "${IMAGE_NAME}:${TAG}" .

# Save image ออกมาเป็นไฟล์ .tar
docker save -o $TAR_PATH "${IMAGE_NAME}:${TAG}"

# Prune cache
docker builder prune -f
# Prune Docker builder cache
docker builder prune -f

# docker compose version *> $null
# if ($LASTEXITCODE -eq 0) {
#     docker compose up -d
# } else {
#     docker-compose up -d
# }
