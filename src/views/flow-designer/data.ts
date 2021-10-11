import { FlowMeta } from '../../flow/types'

export const flow: FlowMeta = {
  "variables": [
    {
      key: 'deptId',
      name: '部门',
      parentKey: 'parent_id',
      titleKey: 'name',
      type: 'refId',
      // unBasic: true,
    },
    {
      key: 'date',
      name: '日期',
      type: 'date',
    },
    {
      key: 'copId',
      name: '公司',
      options: [
        {
          label: '12323232',
          value: '1',
        },
        {
          label: 'bbbbbbb',
          value: '2',
        },
      ],
      titleKey: 'name',
      type: 'singleOption',
      // unBasic: true,
    },
  ],
  "start": {
    "id": "start",
    "name": "开始",
    "connector": {
      "targetReference": 'decision1'
    }
  },
  "assignments": [
    {
      "id": "1111",
      "name": "1111",
      "connector": {
        "targetReference": null
      },
      "defaultConnector": {
        "targetReference": 'end'
      },
    },
    {
      "id": "2222",
      "name": "2222",
      "connector": {
        "targetReference": "loop1"
      },
      "defaultConnector": {
        "targetReference": "end"
      },
      "assignmentItems": []
    },
    {
      "id": "3333",
      "name": "3333",
      "connector": {
        "targetReference": "loop1"
      },
      "defaultConnector": {
        "targetReference": "end"
      },
    },
  ],
  "decisions": [
    {
      "id": "decision1",
      "name": "decision1",
      "connector": {
        "targetReference": null
      },
      "defaultConnector": {
        "targetReference": "2222"
      },
      "defaultConnectorName": "默认分支",
      "rules": [
        {
          "id": "fork1",
          "name": "分支1",
          "description": "分支1",
          "connector": {
            "targetReference": null
          },
          "criteria": {
            "conditions": [
              {
                target: '',
                op: '$eq' as any,
                source: ''
              }
            ]
          }
        },
      ],
    },
  ],
  "loops": [
    {
      "id": "loop1",
      "name": "循环1",
      "nextValueConnector": {
        "targetReference": "loop2"
      },
      "defaultConnector": {
        "targetReference": "1111"
      },
      "collectionReference": "list1",
      "iterationOrder": "desc"
    },
    {
      "id": "loop2",
      "name": "循环2",
      "nextValueConnector": {
        "targetReference": null
      },
      "defaultConnector": {
        "targetReference": "3333"
      },
      "collectionReference": "list1",
      "iterationOrder": "desc"
    },
  ],
}