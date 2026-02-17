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

  private

  def task_params
    params.permit(:title)
  end
end
