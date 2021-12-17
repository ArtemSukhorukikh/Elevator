const express = require('express')
const app = express()
const port = 3000
let floor = 0
let destanationFloor = 0

let outPut = {
    "fl_light_1": 0,
    "fl_light_2": 0,
    "fl_light_3": 0,
    "fl_light_4": 0,

    "el_light_1": 0,
    "el_light_2": 0,
    "el_light_3": 0,
    "el_light_4": 0,

    "go_up_fast": 0,
    "go_up_slow": 0,

    "go_down_fast": 0,
    "go_down_slow": 0,

    "open_doors": 0,
    "close_doors": 0
}
app.use(express.json)

app.post('/', (req, res) => {
    let varOutPut = outPut
    if (floor == 0) 
    {
        varOutPut["go_down_fast"] = 1
        
    }
    if (req.body["zero_floor_sensor"] = 1) {
        varOutPut["go_up_fast"] = 1
    }
    for (let i = 1; i < 5; i++) {
        if (req.body[`floor_sensor_${i}`] == 1) 
        {
            floor = i
            if (req.body[`pass_sensor`] == 1) {
                varOutPut[`el_light_${i}`] = 0
                varOutPut['open_doors'] = 1
                varOutPut['go_down_fast'] = 0
                varOutPut['go_down_slow'] = 0
                varOutPut['go_up_fast'] = 0
                varOutPut['go_up_slow'] = 0
            }
            else
            {
                varOutPut[`fl_light_${i}`] = 0
                varOutPut['open_doors'] = 1
                varOutPut['go_down_fast'] = 0
                varOutPut['go_down_slow'] = 0
                varOutPut['go_up_fast'] = 0
                varOutPut['go_up_slow'] = 0
            }
        }
        
    }
    for (let i = 1; i < 5; i++) {
        if (req.body['pass_sensor'] == 0 && req.body[`floor_sensor_${i}`] == 1 && req.body['door_opened_sensor'] == 1) {
            varOutPut['close_doors'] = 1
            varOutPut['go_down_fast'] = 0
            varOutPut['go_down_slow'] = 0
            varOutPut['go_up_fast'] = 0
            varOutPut['go_up_slow'] = 0
        }
        
    }
    for (let i = 1; i < 5; i++) {
        if (req.body[`fl_btn_${i}`] == 1) 
        {
            varOutPut[`fl_light_${i}`] = 1
            destanationFloor = i
            if (destanationFloor > floor) {
                varOutPut['go_up_fast'] = 1
            }
            else
            {
                varOutPut['go_down_fast'] = 1
            }
        }
        if (req.body[`el_btn_${i}`] == 1) 
        {
            varOutPut['close_doors'] = 1
            varOutPut[`el_light_${i}`] = 1
            destanationFloor = i
            if (destanationFloor > floor) {
                varOutPut['go_up_fast'] = 1
            }
            else
            {
                varOutPut['go_down_fast'] = 1
            }
        }
        if (req.body[`stopping_sensor_${i}`] == req.body[`fl_btn_${i}`] || req.body[`stopping_sensor_${i}`] == req.body[`el_btn_${i}`]) 
        {
            if (destanationFloor > floor) {
                varOutPut['go_up_slow'] = 1
            }
            else
            {
                varOutPut['go_down_slow'] = 1
            }
        }
    }
    res.send(varOutPut)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
