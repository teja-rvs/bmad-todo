# frozen_string_literal: true

class TasksController < ApplicationController
  def index
    tasks = Task.order(created_at: :asc)
    render json: { tasks: tasks.as_json(only: %i[id title completed created_at updated_at]) }
  end

  def create
    task = Task.new(task_params)
    if task.save
      render json: task.as_json(only: %i[id title completed created_at updated_at]), status: :created
    else
      render json: { error: task.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  def update
    task = Task.find_by(id: params[:id])
    if task.nil?
      render json: { error: "Task not found" }, status: :not_found
      return
    end
    if task.update(update_params)
      render json: task.as_json(only: %i[id title completed created_at updated_at]), status: :ok
    else
      render json: { error: task.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  private

  def task_params
    params.permit(:title)
  end

  def update_params
    params.permit(:completed)
  end
end
