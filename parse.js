const parse = require('csv-parse')
const fs = require('fs')
const CSV_PATH = "./bl3.csv"
let output = {}
const headers = ['splash', 'Element', 'World Drop', 'Can Drop From', 'Quest Challenge', 'Location', 'Summary', 'Ammo per shot', 'Red Text', 'Notes']
// Create the parser
const parser = parse({
    delimiter: ','
  })
  // Use the readable stream api
  parser.on('readable', function(){
    let record
    let currentMan = ''
    let currentType = ''
    while (record = parser.read()) {
        const [manufactor, type, name,, ...attrs ] = record
        if (manufactor) {
            output[manufactor.replaceAll("\n", "")] = {}
            currentMan = manufactor.replaceAll("\n", "")
            if (manufactor && !type){
                output[currentMan][currentType] = {}
            }
        }
        if (type) {
            if (type === 'Grenade\nMod'){
                output['GrenadeMod'] = {}
            } else {
                output[currentMan][type] = {}                
            }
            currentType = type.replaceAll("\n", "")
        }
        if (currentType === 'GrenadeMod') {
            output['GrenadeMod'][name] = {}
            for (let i = 0; i < headers.length;  i++) {
                const element = headers[i];
                if (element === 'Summary') {
                    output['GrenadeMod'][name][element] = attrs[i]
                    attrs.splice(i - 1,6)
                } else {
                    output['GrenadeMod'][name][element] = attrs[i] ? attrs[i] : "FALSE"
                }
            }
        } else {
            if (name.length > 0) {
                output[currentMan][currentType][name] = {}
                for (let i = 0; i < headers.length;  i++) {
                    const element = headers[i];
                    if (element === 'Summary') {
                        output[currentMan][currentType][name][element] = attrs[i]
                        attrs.splice(i - 1,6)
                    } else {
                        output[currentMan][currentType][name][element] = attrs[i] ? attrs[i] : "FALSE"
                    }
                }
            }
        }
    }
  })
  // Catch any error
  parser.on('error', function(err){
    //console.error(err.message)
  })

  // Write data to the stream
  fs.readFile(CSV_PATH, (err, data) => {
    parser.write(data)
    parser.end()
  })

  parser.on('end', async () => {
      await cleanUp();
      fs.writeFile('./data.json', JSON.stringify(output), (err) => {
          if (err) console.log(err)
      })
  })



function cleanUp () {
      return new Promise((res, rej) => {
          Object.keys(output).forEach(key => {
            if (!output[key]) {
                delete output[key]
            } else if (Object.keys(output[key]).length <= 0) {
                delete output[key]
            }
            output[key] ? Object.keys(output[key]).forEach(element => {
                if (element === 'GrenadeMod') {
                    delete output[key]
                }
                if (!element || element.length <= 0) {
                    delete output[key][element]
                }
            }) : null
        });
        setTimeout(res, 1000)
      })
  }