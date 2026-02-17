# frozen_string_literal: true

class TasksController < ApplicationController
  def index
    tasks = Task.order(created_at: :asc)
    render json: { tasks: tasks.as_json(only: %i[id title completed created_at updated_at]) }
  end
end
