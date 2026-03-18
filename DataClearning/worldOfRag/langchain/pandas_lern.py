import pandas as pd
df=pd.read_csv("../../data/schemes_clean.csv")

# print(df.iloc[3]["full_text"])
# print(df.iloc[3]["scheme_name"])
# print(df.iloc[3]["level"])
# print(df.iloc[3]["schemeCategory"])
# print(df.iloc[3]["tags"])
# print(df.iloc[2].get("scheme_name","Not Found")) 

print(df.iloc[0])
