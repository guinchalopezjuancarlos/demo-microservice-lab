terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }
}

provider "aws" {
  region = var.region
}

data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["137112412989"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-kernel-6.1-x86_64"]
  }
}

resource "aws_key_pair" "this" {
  key_name   = "${var.project_name}-kp"
  public_key = var.public_ssh_key
}

resource "aws_security_group" "this" {
  name        = "${var.project_name}-sg"
  description = "Acceso SSH limitado e HTTP publico"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Salida libre"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-sg"
    Project = var.project_name
  }
}

locals {
  user_data = <<-EOT
    #!/bin/bash
    set -euxo pipefail

    # Instalar y arrancar SSM Agent (para AWS Systems Manager)
    dnf install -y amazon-ssm-agent
    systemctl enable amazon-ssm-agent
    systemctl start amazon-ssm-agent

    # Actualizar sistema e instalar Docker y Git
    dnf update -y
    dnf install -y docker git
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ec2-user

    # Crear directorio de la app
    mkdir -p /app
    cd /app

    # Clonar tu repo (ajusta URL si es necesario)
    git clone https://github.com/tu_usuario/demo-microservice-lab-git.git .

    # Levantar MySQL
    docker run -d --name mysql-demo -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=itemsdb -p 3306:3306 mysql:8

    # Esperar que MySQL esté listo
    sleep 20

    # Crear tabla si no existe
    docker exec -i mysql-demo mysql -u root -proot itemsdb -e "CREATE TABLE IF NOT EXISTS items (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL);"

    # Construir imagen Node.js
    docker build -t node_app_image .

    # Levantar contenedor Node.js conectado a MySQL
    docker run -d --name node-app_container -p 3000:3000 --network host node_app_image
  EOT
}

resource "aws_instance" "this" {
  ami                         = data.aws_ami.al2023.id
  instance_type               = "t3.micro"
  key_name                    = aws_key_pair.this.key_name
  vpc_security_group_ids      = [aws_security_group.this.id]
  user_data                   = local.user_data
  associate_public_ip_address = true

  tags = {
    Name    = "${var.project_name}-ec2"
    Project = var.project_name
  }
}
