import json
import requests
client_folders_list = ['','1u3CFCekQqXeyXlDf2I8JCtPeACKxUEw_','149yTPAa8wbYbwuy9V7H2a5yzndJzrWKf',
                       '1W7kbnxGKPbaniKVCNSXWkaryfVtiOIiw','173OOgbV4pNYtveR3K_DgFfoqs96cBXZ7',
                       '1HHKeXYZfTSeSdY1NWtQ8vSfEL-LNk7E5','12HV0SiG6aeAK1XBaTb7EGQ1uIfXyvDme',
                       '1ooMHpuytQl17F3fQkXQWOUH82uV6eaBj','16_rab6wygsXXvOUzk_KSxrMPx1zx4hHQ',
                       '1CHXPuOdNZVNbwWtTz73bmzFPoBOpN6JY','16Xsm53u6EXfkUl07rRVCL5gg2M8RnInv',
                       '1Wkq9VlnP4OdSo8OuNaeRjrZFRBom-Trz','1b69jHg5_rIIIwLD32bMItPXoIVRpONrl',
                       '1HpGka0RPYk5SWiO9i_5ifAThzFAoYJ9G','1rvtg9bk5IWAvH_48IO5ATqdePhckbpMF',
                       '1S43WWlwxXNnYXMZ5TlavhAEl2DI_QyRx','1hWbA0cKARivDPbppQOj9uQR3qfjMc3kl',
                       '1VLsm4pSjB5J4Pj8E-OiA7i4gbt1IJbL_','1SR5BS4rpaCgC_bUazztW1AQ1ggTfFEPi',
                       '1cToOdORk2Xz-dr-A7jzc2xRi3_T1YjST','1S1LQCC9NwKYX8tO8NsMj2uRl859VvTZ8',
                       '1wPyGG4yjW9gpFQt_Skg8GrTHI98fPBwD','1w-AkBy7AjWrNOPpPaxQZ1Vzha5JTPbFj',
                       '1xzjV9H4ZBoxce3VgCWrsJ3eKQgp9yVhn','1B5v0Nlxo8s2jcvMmbGnPgJZ0guQJw99f',
                       '12SwA0bVpdxwDqbDGlWsHHv2-y19SIqRc','1lQyWY9EVYSjjfYXrUhln30svd3V4LjuT',
                       '1xRFdZIA35yDuKrVvHdrPhbFcZtdfVNoy','1vH7f_e8_yQfxz4-cx1RH5qrBQcKdgdml',
                       '1rNflZMoSVziMufOH2vRy5h1A9MKSrGQL','1aieq5jMc-YpP5HUtKXw3d6uIRmcCqj4O',
                       '1VEk1HnUqkAvbe9jD3wGvRfiZpXoAefu3','1ewJqDieu44gFbdm3iB_piXBzM5jVpwLv',
                       '1fpYJdcQ1HtU2pSP2Dnych5J7nOO3FOYM','1e5mPS7VbJ4DSbwDN-oRG_rMk8-xwN_LD',
                       '1vDK0lRkwizFYsgHnsqCYwHoPY06G6Sxh','1uvhQVlUvOUhQPN2j-HTdhEZBNAa1wzKb',
                       '1ga0BTqG0p0r94NY3H4M8aL2Bt0T9pTIM','1Btg9tBx8taBW7C7IO125aepf2z9OB9TS',
                       '1wNkbQhMDQhgGYQ5S4lwJBs1LDfiWbHnM','1ziuJqYRCEjScVbwYRwvQAvAMEKc26cjl',
                       '15ce4G_uSTG6w0ZoQvLrccNbE58Zh6iWG','19JIBAYPX1GbWBSM7YaZcldfI3E1AobNQ',
                       '1B4-E9n30LIGlBqaBwhNRUhaArDBaob8G','1Z5LZryjuI99Lmud2O7GYFizfjj0s02P7',
                       '1wPR8H-BVJ12K6x8Kb4bi6RZB3SzGpvAO','1wnnjwkKq9F9t7A_y3pXYjjHIgsTETvdF',
                       '1zPRnrSqHes04A7zqqkXBtlAXUvmjLgNO','1Spae5y-eUz7Wttk5I-wIudFd-sfQFpyk',
                       '1hcImMzRTTHsl5he11BfBNZb3bR5_zO-n','1MewQH_Upg7ngFuj33e2xoeZR1llBHkd5',
                       '1VWACiqr1UwDPbHVAVs_yvpY9CgCvd_uS','1rVHQmaoehomnu3CIC7UwvKExVg5ZHX50',
                       '1TFFgFFBxBV6BcwiPdvWTJiwqN-2PKHw7','1xG_omoWxPbfVmszSyzu-VN_A_3oix1cw',
                       '1opLNGnimaPoLTwL_uV6mjKZytIwWU8nF','1kfm_7XLDS36pSO6WnwCfEggMEfkia2TD',
                       '1AdDXDyHqeriqjGK_5XCGvYVJCwvSKx3r','1Yet4t76jiGeWUyw8ZuNOm1QhFqdYhtZk',
                       '17AagcRJmQ7JH25rX3258PMYRDb9zdjC6','1TRFL7eDUcKc7tGOGQRiEY8kgYNHWDPjT',
                       '1TD87aGdR4rmq5UiLlYmsUdXb1jMTmOWg','1zvM0m3fLfqjWcVYJMlULwnlzsLJ5nsgw',
                       '1TwCezBlKZ_W1MwpkHWMYUkk7kCAJKvz5','1pKV_SDfSuHndyXBns1QyPwsrjzOb6iOq',
                       '1v8pVdRSdirmz_XvlSS3fB6nV2LHP_X91','1MeE9ylScACVuRnBxhGkjCVVVRl_d0UF8',
                       '1tOa-_Xjp7CTFbPFY4kmBrwVAOaLNtU1a','1Y54_k3hy6PWmXm0J6Ydrs6yY85UjJxGY',
                       '1o36cXevmHEXYfNzpapetFIeVk0XO8LmZ','1QmFGdF5LeWIQ4Fto_NDtjq-U6KKqyWFW',
                       '1jgK8w25yL-5lCon8lwhtrogUlpPA8bmc','1djB5FX-sEsxlMa4IayufxXlHkM-iwE9c',
                       '1d_D6LbZtj5bKrTWjkmXB14xsvUXGeK5M','1MufhOXHQWD1ltIfrdy4RJVmFZCBUb2ai',
                       '1HG5rPI8TNgrmGOrx87xgi7rylCZ_yomj','16KsSQLaO9whotSaH4xGeM-O2YABIQzBC',
                       '1qKDxj5BMHtRFd8rXu2GSII_Azy4X3whS','1ehgx0jxwKhQqqkl2zHI6d8xsPrzLvHOU',
                       '1QwuK0hKb1G_Jk7xHZTk_aISzbGCJ9F44','1ep7zvuSuFeRsrbsvt4J1oBGd8bfVFUTC',
                       '16B45NDeWNrJ1JZMYAxe4L2zm8qC-uC2v','13HOAefPydeG1UubruwrcW4Upb1F30Fq6',
                       '181Kjr9-s6n-nfqxfdWEjoCmw-FKEn_lD','1Oe3at0XWPMbg_alnRtkKWNNvAdetm8nZ',
                       '167JnZLDrVrw6-y405SHPaexvOQvx9HbY','1tx21bX1iENFiKq6fhaIz_QoGynSlDy1B',
                       '1wFyWscHCJ9GtbPu528lpACcRD4_qtBPX','1UXBnDv_KrvVemHvSwj_5wJO0fd2ccfue',
                       '1E-cl57vKU0E5wcc_d8C6oD42onrNnqjR','1HUA-54c_RF5ob4NcTeuZ4Pg20vYXQM7Y',
                       '1usBsahpRo0yDQeLP3xV94Quwk-eau8Ew','1x61tX3g22qXqGmSNzOrXIJ3hLxnxTV8V',
                       '1YRCT51mujJoCT89y4Ut8Tb5L-dWMZVV3','11k0wS-t_mGhyErwiCYzLwyHE6poOYHbm',
                       '1DtwhtmtIcExRTBb6NQb-NjEcbmOJQsVg','1VuDvBlEkVj5R4NAaJaivkDopPghb1cTh',
                       '1KEtHRM0v5mnOXfxNHPtgMGpAWAwpZZ7_','1cF-17vo0dTma6uLflgSwn2KUvXxAdm59',
                       '14qXoXu2nMGwSpnzJ_785jJtLiPGBTNM7','1suKbHGPcSX3AZ9tf8M38bkObN3RQWVTe']
headers = {"Authorization": "Bearer ya29.a0Aa4xrXOA2UpXxmWr7sl2xOTuPvD14J3tk5KgO0ke9k4vkjEu-u6XSxz42HMKby9ll6ZBAqocqxs-DH3x8hz_pqPeAaj99zIab8dDWXdsm0jdYhY0JklkfiHSSZT-hUCP0oMPzxJSzpLfRkd1N-1Dm7yt359xaCgYKATASARMSFQEjDvL9Dc-3L-BV6kDTOZ9u00xEqw0163"}
para = {
    "name": "Abeera Bill.pdf",
    "parents": ["1u3CFCekQqXeyXlDf2I8JCtPeACKxUEw_"]
}
files = {
    'data': ('metadata', json.dumps(para), 'application/json; charset=UTF-8'),
    'file': open("Customer_Bills/abeera_4_923006450782.pdf", "rb")
}
r = requests.post(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    headers=headers,
    files=files
)