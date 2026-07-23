export default defineNitroPlugin(() => {
  ;(BigInt.prototype as any).toJSON = function () {
    return this.toString()
  }
})
