#run app
npm start 


#docker build image
sudo docker build -t vfursov/express_chat .
#docker run container
sudo docker run -p 3000:3000 vfursov/express_chat
#docker run container (online editing, run it from project folder)
sudo docker run -p 3000:3000 -v $(pwd):/var/www/app vfursov/express_chat
