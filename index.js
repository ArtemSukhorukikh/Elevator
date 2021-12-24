const express = require('express')
const bodyParser = require('body-parser')
var StateMachine = require('javascript-state-machine');


curtFloor = 0
destanationFloor = null
function zeroOutPut() {
    return {
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
}

varOutPut = zeroOutPut()

var fsm = new StateMachine({
    init: 'startPoint',
    transitions: [
        {name: 'search', from: 'startPoint', to: 'init_search'},
        {name: 'idel', from: 'init_search', to: 'idle'},
        {name: 'upFast', from: 'idle', to: 'go_up_fast'},
        {name: 'downFast', from: 'idle', to: 'go_down_fast'},
        {name: 'opening', from: 'idle', to: 'opening_doors'},
        {name: 'stopingUp', from: 'go_up_fast', to: 'go_up_slow'},
        {name: 'stopingDown', from: 'go_down_fast', to: 'go_down_slow'},
        {name: 'opening', from: 'go_up_slow', to: 'opening_doors'},
        {name: 'opening', from: 'go_down_slow', to: 'opening_doors'},
        {name: 'fullOpening', from: 'opening_doors', to: 'door_opend'},
        {name: 'startClosing', from: 'door_opend', to: 'door_closing'},
        {name: 'fullClosed', from: 'door_closing', to: 'door_closed'},
        {name: 'opening', from: 'door_closing', to: 'opening_doors'},
        {name: 'opening', from: 'door_closed', to: 'opening_doors'},
        {name: 'endWaiting', from: 'door_closed', to: 'idle'},
        {name: 'upWithPassanger', from: 'door_closed', to: 'go_upFast'},
        {name: 'downWithPassanger', from: 'door_closed', to: 'go_down_fast'},
        {name: 'upFloor', from: 'go_up_fast', to: 'go_up_fast'},
        {name: 'downFloor', from: 'go_down_fast', to: 'go_down_fast'},
    ],
    methods: {
        onSearch: function() {
            varOutPut["go_down_slow"] = 1
        },
        onIdel: function () {
            varOutPut = zeroOutPut()
        },
        onUpFast: function () {
            varOutPut["go_up_fast"] = 1
            varOutPut[`fl_light_${destanationFloor}`] = 1
        },
        onDown_fast: function (floor) {
            varOutPut["go_up_down"] = 1
            varOutPut[`fl_light_${destanationFloor}`] = 1
        },
        onOpening: function () {
            varOutPut = zeroOutPut()
            destanationFloor = 0
            varOutPut["open_doors"]= 1
        },
        onStopingUp: function () {
            varOutPut["go_up_fast"] = 0
            varOutPut["go_up_slow"] = 1
        },
        onStopingDown: function () {
            varOutPut["go_down_fast"] = 0
            varOutPut["go_up_down"] = 1
        },
        onFullOpening: function () {
            varOutPut = zeroOutPut()
        },
        onStartClosing: function () {
            varOutPut["close_doors"] = 1
        },
        onFullClosed: function () {
            varOutPut = zeroOutPut()
        },
        onEndWaiting: function () {
            destanationFloor = 0
        },
        onUpWithPassanger: function () {
            varOutPut = zeroOutPut()
            varOutPut["go_up_fast"] = 1
            varOutPut[`el_light_${destanationFloor}`] = 1
        },
        onDownWithPassanger: function () {
            varOutPut = zeroOutPut()
            varOutPut["go_down_fast"] = 1
            varOutPut[`el_light_${destanationFloor}`] = 1
        },
        onUpFloor: function () {
            curtFloor++
            varOutPut["go_up_fast"] = 1
        },
        onDownFloor: function () {
            curtFloor--
            varOutPut["go_down_fast"] = 1
        }

    }
})
const app = express()
const port = 3000
floor = 0
destanationFloor = null

var oldJson = {
    "fl_btn_1": 0,
    "fl_btn_2": 0,
    "fl_btn_3": 0,
    "fl_btn_4": 0,

    "el_btn_1": 0,
    "el_btn_2": 0,
    "el_btn_3": 0,
    "el_btn_4": 0,

    "open_doors_btn": 0,
    "stop_btn": 0,

    "pass_sensor": 0,
    "obstacle_sensor": 0,
    "door_opened_sensor": 0,
    "door_closed_sensor": 0,

    "stopping_sensor_1": 0,
    "stopping_sensor_2": 0,
    "stopping_sensor_3": 0,
    "stopping_sensor_4": 0,

    "floor_sensor_1": 0,
    "floor_sensor_2": 0,
    "floor_sensor_3": 0,
    "floor_sensor_4": 0,

    "zero_floor_sensor": 0,
    "last_floor_sensor": 0
}

//app.use(express.json)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
  }));

app.get('/', (req, res) => {
    res.status = 418
    res.send('')
})

app.post('/', (req, res) => {
    //console.log(req.body)
    if (fsm.state == 'startPoint') {
        fsm.search()
        //fsm.on_search()
        
    }
    else
    {
        if (fsm.state == 'init_search') 
        {
            if (req.body['zero_floor_sensor'] == 1) {
                curtFloor = 1
                fsm.idel()
            }
            else 
            {
                for (let i = 1; i < 5; i++) 
                {
                    if (req.body[`floor_sensor_${i}`] == 1) 
                    {
                        curtFloor = i
                        fsm.idel()
                        break
                    }    
                }
            }
            
        }
        else if (fsm.state == 'idle') 
        {
            for (let i = 1; i < 5; i++) 
            {
                if (req.body[`fl_btn_${i}`] == 1) 
                {
                    destanationFloor = i
                    if (destanationFloor > curtFloor) 
                    {
                        fsm.upFast()
                        curtFloor++
                        //fsm.onUpFast(destanationFloor)
                    }
                    else if (destanationFloor < curtFloor) 
                    {
                        fsm.downFast()
                        curtFloor--
                    }
                    else if (destanationFloor = curtFloor) 
                    {
                        varOutPut = zeroOutPut()
                        //console.log(fsm.transitions)
                        fsm.opening()
                    }
                }
            }
        }
        else if (fsm.state == 'go_up_fast' || fsm.state == 'go_down_fast') {
            if (curtFloor == destanationFloor) {
                if (req.body[`stopping_sensor_${destanationFloor}`] == 1) {
                    destanationFloor = 0
                    if (fsm.state == 'go_up_fast') 
                    {
                        fsm.stopingUp()
                    }
                    else if (fsm.state == 'go_down_fast')
                    {
                        fsm.stopingDown()
                    }
                }
            }
            else
            {
                if (fsm.state == 'go_up_fast') 
                {
                    fsm.upFloor()
                }
                else if (fsm.state == 'go_down_fast')
                {
                    fsm.downFloor()
                }
            }
        }
        else if (destanationFloor == 0) 
        {
            if (fsm.state == 'opening_doors' && req.body['door_opened_sensor'] == 1)
            {
                fsm.fullOpening()
            }
            else if (fsm.state == 'door_opend') 
            {
                fsm.startClosing()
            }
            else if (fsm.statr == 'door_closing') 
            {
                if (req.body['obstacle_sensor'] == 1 || req.body['open_doors_btn'] == 1) 
                {
                    fsm.opening()
                }
                else
                {
                    fsm.fullClosed()
                }
            }
            else if (fsm.state == 'door_closed' && req.body['open_doors_btn'] == 1) {
                fsm.opening()
            }
            else 
            {
                fsm.opening()
            }
                
        }
        else if (fsm.state == 'door_closed') 
        {
            if (req.body['pass_sensor'] == 1) 
            {
                for (let i = 1; i < 5; i++) 
                {
                    if (req.body[`el_btn_${i}`] == 1) 
                    {
                        destanationFloor = i
                    if (destanationFloor > curtFloor) 
                    {
                        fsm.upWithPassanger()
                        curtFloor++
                        //fsm.onUpFast(destanationFloor)
                    }
                    else if (destanationFloor < curtFloor) 
                    {
                        fsm.downWithPassanger()
                        curtFloor--
                    }
                    else if (destanationFloor = curtFloor) 
                    {
                        varOutPut = zeroOutPut()
                        //console.log(fsm.transitions)
                        fsm.opening()
                    }
                        break
                    }
                }
            }

        }
        else if (req.body['stop_btn'] == 1)
        {
            destanationFloor = curtFloor
            if (fsm.state == 'go_up_fast') 
            {
                fsm.stopingUp()
            }
            else if (fsm.state == 'go_down_fast')
            {
                fsm.stopingDown()
            }
        }
        
    }


    console.log(fsm.state)
    console.log(curtFloor)
    console.log(destanationFloor)
    console.log('----------------------------------------')
    res.send(varOutPut)
})

app.get('/refresh', (req, res) => {
    var fsm = new StateMachine({
        init: 'startPoint',
        transitions: [
            {name: 'search', from: 'startPoint', to: 'init_search'},
            {name: 'idel', from: 'init_search', to: 'idle'},
            {name: 'upFast', from: 'idle', to: 'go_up_fast'},
            {name: 'downFast', from: 'idle', to: 'go_down_fast'},
            {name: 'opening', from: 'idle', to: 'opening_doors'},
            {name: 'stopingUp', from: 'go_up_fast', to: 'go_up_slow'},
            {name: 'stopingDown', from: 'go_down_fast', to: 'go_down_slow'},
            {name: 'opening', from: 'go_up_slow', to: 'opening_doors'},
            {name: 'opening', from: 'go_down_slow', to: 'opening_doors'},
            {name: 'fullOpening', from: 'opening_doors', to: 'door_opend'},
            {name: 'startClosing', from: 'door_opend', to: 'door_closing'},
            {name: 'fullClosed', from: 'door_closing', to: 'door_closed'},
            {name: 'opening', from: 'door_closing', to: 'opening_doors'},
            {name: 'opening', from: 'door_closed', to: 'opening_doors'},
            {name: 'endWaiting', from: 'door_closed', to: 'idle'},
            {name: 'upWithPassanger', from: 'door_closed', to: 'go_upFast'},
            {name: 'downWithPassanger', from: 'door_closed', to: 'go_down_fast'},
            {name: 'upFloor', from: 'go_up_fast', to: 'go_up_fast'},
            {name: 'downFloor', from: 'go_down_fast', to: 'go_down_fast'},
        ],
        methods: {
            onSearch: function() {
                varOutPut["go_down_slow"] = 1
            },
            onIdel: function () {
                varOutPut = zeroOutPut()
            },
            onUpFast: function () {
                varOutPut["go_up_fast"] = 1
                varOutPut[`fl_light_${destanationFloor}`] = 1
            },
            onDown_fast: function (floor) {
                varOutPut["go_up_down"] = 1
                varOutPut[`fl_light_${destanationFloor}`] = 1
            },
            onOpening: function () {
                varOutPut = zeroOutPut()
                destanationFloor = 0
                varOutPut["open_doors"]= 1
            },
            onStopingUp: function () {
                varOutPut["go_up_fast"] = 0
                varOutPut["go_up_slow"] = 1
            },
            onStopingDown: function () {
                varOutPut["go_down_fast"] = 0
                varOutPut["go_up_down"] = 1
            },
            onFullOpening: function () {
                varOutPut = zeroOutPut()
            },
            onStartClosing: function () {
                varOutPut["close_doors"] = 1
            },
            onFullClosed: function () {
                varOutPut = zeroOutPut()
            },
            onEndWaiting: function () {
                destanationFloor = 0
            },
            onUpWithPassanger: function () {
                varOutPut = zeroOutPut()
                varOutPut["go_up_fast"] = 1
                varOutPut[`el_light_${destanationFloor}`] = 1
            },
            onDownWithPassanger: function () {
                varOutPut = zeroOutPut()
                varOutPut["go_down_fast"] = 1
                varOutPut[`el_light_${destanationFloor}`] = 1
            },
            onUpFloor: function () {
                curtFloor++
                varOutPut["go_up_fast"] = 1
            },
            onDownFloor: function () {
                curtFloor--
                varOutPut["go_down_fast"] = 1
            }
    
        }
    })
    destanationFloor = null
    curtFloor = 0
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
