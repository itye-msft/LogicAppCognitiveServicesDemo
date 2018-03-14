{
    "$connections": {
        "value": {
            "cognitiveservicescomputervision": {
                "connectionId": "/subscriptions/73a4ea93-d914-424d-9e64-28adf397e8e3/resourceGroups/LogicAppCognitiveServicesDemoRg/providers/Microsoft.Web/connections/cognitiveservicescomputervision-1",
                "connectionName": "cognitiveservicescomputervision-1",
                "id": "/subscriptions/73a4ea93-d914-424d-9e64-28adf397e8e3/providers/Microsoft.Web/locations/westeurope/managedApis/cognitiveservicescomputervision"
            },
            "cognitiveservicestextanalytics": {
                "connectionId": "/subscriptions/73a4ea93-d914-424d-9e64-28adf397e8e3/resourceGroups/LogicAppCognitiveServicesDemoRg/providers/Microsoft.Web/connections/cognitiveservicestextanalytics-5",
                "connectionName": "cognitiveservicestextanalytics-5",
                "id": "/subscriptions/73a4ea93-d914-424d-9e64-28adf397e8e3/providers/Microsoft.Web/locations/westeurope/managedApis/cognitiveservicestextanalytics"
            },
            "microsofttranslator": {
                "connectionId": "/subscriptions/73a4ea93-d914-424d-9e64-28adf397e8e3/resourceGroups/LogicAppCognitiveServicesDemoRg/providers/Microsoft.Web/connections/microsofttranslator",
                "connectionName": "microsofttranslator",
                "id": "/subscriptions/73a4ea93-d914-424d-9e64-28adf397e8e3/providers/Microsoft.Web/locations/westeurope/managedApis/microsofttranslator"
            },
            "rss": {
                "connectionId": "/subscriptions/73a4ea93-d914-424d-9e64-28adf397e8e3/resourceGroups/LogicAppCognitiveServicesDemoRg/providers/Microsoft.Web/connections/rss",
                "connectionName": "rss",
                "id": "/subscriptions/73a4ea93-d914-424d-9e64-28adf397e8e3/providers/Microsoft.Web/locations/westeurope/managedApis/rss"
            },
            "slack": {
                "connectionId": "/subscriptions/73a4ea93-d914-424d-9e64-28adf397e8e3/resourceGroups/LogicAppCognitiveServicesDemoRg/providers/Microsoft.Web/connections/slack",
                "connectionName": "slack",
                "id": "/subscriptions/73a4ea93-d914-424d-9e64-28adf397e8e3/providers/Microsoft.Web/locations/westeurope/managedApis/slack"
            }
        }
    },
    "definition": {
        "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
        "actions": {
            "Condition": {
                "actions": {
                    "For_each": {
                        "actions": {
                            "Condition_2": {
                                "actions": {
                                    "Analyze_Image": {
                                        "inputs": {
                                            "body": {
                                                "url": "@{items('For_each')}"
                                            },
                                            "host": {
                                                "connection": {
                                                    "name": "@parameters('$connections')['cognitiveservicescomputervision']['connectionId']"
                                                }
                                            },
                                            "method": "post",
                                            "path": "/vision/v1.0/analyze",
                                            "queries": {
                                                "format": "Image URL",
                                                "visualFeatures": "Tags,Description,Categories"
                                            }
                                        },
                                        "runAfter": {},
                                        "type": "ApiConnection"
                                    },
                                    "Post_message": {
                                        "inputs": {
                                            "host": {
                                                "connection": {
                                                    "name": "@parameters('$connections')['slack']['connectionId']"
                                                }
                                            },
                                            "method": "post",
                                            "path": "/chat.postMessage",
                                            "queries": {
                                                "channel": "C9NFGRLJK",
                                                "text": "@{body('Translate_text')}\n@{items('For_each')}\n@{concat(body('Analyze_Image')?['description']?['captions'])}"
                                            }
                                        },
                                        "runAfter": {
                                            "Analyze_Image": [
                                                "Succeeded"
                                            ]
                                        },
                                        "type": "ApiConnection"
                                    }
                                },
                                "expression": {
                                    "and": [
                                        {
                                            "endsWith": [
                                                "@items('For_each')",
                                                "jpg"
                                            ]
                                        }
                                    ]
                                },
                                "runAfter": {},
                                "type": "If"
                            }
                        },
                        "foreach": "@triggerBody()?['links']",
                        "runAfter": {
                            "Translate_text": [
                                "Succeeded"
                            ]
                        },
                        "type": "Foreach"
                    },
                    "Translate_text": {
                        "inputs": {
                            "host": {
                                "connection": {
                                    "name": "@parameters('$connections')['microsofttranslator']['connectionId']"
                                }
                            },
                            "method": "get",
                            "path": "/Translate",
                            "queries": {
                                "languageTo": "it",
                                "query": "@triggerBody()?['summary']"
                            }
                        },
                        "runAfter": {},
                        "type": "ApiConnection"
                    }
                },
                "expression": {
                    "and": [
                        {
                            "less": [
                                "@body('Detect_Sentiment')?['score']",
                                0.3
                            ]
                        }
                    ]
                },
                "runAfter": {
                    "Detect_Sentiment": [
                        "Succeeded"
                    ]
                },
                "type": "If"
            },
            "Detect_Sentiment": {
                "inputs": {
                    "host": {
                        "connection": {
                            "name": "@parameters('$connections')['cognitiveservicestextanalytics']['connectionId']"
                        }
                    },
                    "method": "post",
                    "path": "/sentiment"
                },
                "runAfter": {},
                "type": "ApiConnection"
            }
        },
        "contentVersion": "1.0.0.0",
        "outputs": {},
        "parameters": {
            "$connections": {
                "defaultValue": {},
                "type": "Object"
            }
        },
        "triggers": {
            "When_a_feed_item_is_published": {
                "inputs": {
                    "host": {
                        "connection": {
                            "name": "@parameters('$connections')['rss']['connectionId']"
                        }
                    },
                    "method": "get",
                    "path": "/OnNewFeed",
                    "queries": {
                        "feedUrl": "https://news.un.org/feed/subscribe/en/news/topic/migrants-and-refugees/feed/rss.xml"
                    }
                },
                "recurrence": {
                    "frequency": "Minute",
                    "interval": 3
                },
                "splitOn": "@triggerBody()?['value']",
                "type": "ApiConnection"
            }
        }
    }
}
