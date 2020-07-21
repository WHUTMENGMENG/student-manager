let str = "::fff::.1.2.3"

let regExp = /([^0-9])*((\.|\d)*)/



console.log(regExp.exec(str))