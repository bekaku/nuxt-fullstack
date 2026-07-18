$ErrorActionPreference = "Stop"

$IMAGE_NAME = "nuxtui-web"
$TAG = "latest"
$BUILD_DIR = "./build"

if (Test-Path $BUILD_DIR) {
    Remove-Item -Path $BUILD_DIR -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $BUILD_DIR | Out-Null

Remove-Item -ErrorAction SilentlyContinue ".\$BUILD_DIR\${IMAGE_NAME}.tar"

docker image inspect "${IMAGE_NAME}:${TAG}" *> $null
if ($LASTEXITCODE -eq 0) {
    docker rmi "${IMAGE_NAME}:${TAG}"
}

docker image build --no-cache -t "${IMAGE_NAME}:${TAG}" .


# Save Docker image to a tar file
# docker save -o ".\${BUILD_DIR}\${IMAGE_NAME}.tar" "${IMAGE_NAME}:${TAG}"

# Prune Docker builder cache
docker builder prune -f

# docker compose version *> $null
# if ($LASTEXITCODE -eq 0) {
#     docker compose up -d
# } else {
#     docker-compose up -d
# }
