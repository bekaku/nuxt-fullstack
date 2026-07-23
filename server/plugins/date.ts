export default defineNitroPlugin(() => {
  // ; (Date.prototype as any).toJSON = function () {

  // Suppose we want to return the server's local time instead of UTC (ISO).
  // Or you could wrap `this` with a library like dayjs to format it.
  // Example: Returns a readable string.
  // return this.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })
  // }

})
