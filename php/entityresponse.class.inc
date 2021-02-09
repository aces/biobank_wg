<?php
class EntityResponse
{
    function __construct(\LORIS\Data\DataInstance $entity, function $validator)
    {
        $this->entity = $entity;
        $this->errors = $validator($entity);
    }

    function getEntity() {
        return $this->entity;
    }
   
    function getErrors() {
        return $this->errors;
    }

    function isValid() {
        return empty($this->errors);
    }
}
