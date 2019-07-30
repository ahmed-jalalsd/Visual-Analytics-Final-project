import numpy as np
import pandas as pd
from matplotlib import pyplot as plt
from matplotlib.mlab import PCA as mlabPCA
from sklearn import preprocessing



def generateFile(label,Y,dataFile):
    att=['Y1','Y2', 'Y3', 'Y4', 'Y5', 'Y6']+label
    f=open('pca.csv','w')
    fin=open(dataFile)
    for i in range(len(att)-1):
        print(att[i],',',end='',file=f)
    print(att[-1],file=f)
    for i in range(len(Y)):
        #s=fin.readline()
        print(Y[i][0],',',Y[i][1],',', Y[i][2],',' ,Y[i][3],',' ,Y[i][4],',' ,Y[i][5],',', file=f)   
    f.close()
    

#read data from a CSV file, you can choose different delimiters
att=['teaching', 'international', 'research', 'citation', 'income', 'cost_of_living']
data = pd.io.parsers.read_csv(
     'rankings.csv', 
     header=None
    )
data.columns=att
# print(data.head())
d=data.values #we exclude the first column

d_pca = mlabPCA(d)  
generateFile(att,d_pca.Y,'rankings.csv')












