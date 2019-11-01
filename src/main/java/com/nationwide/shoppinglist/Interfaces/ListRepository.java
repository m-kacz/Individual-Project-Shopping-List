package com.nationwide.shoppinglist.Interfaces;
import java.util.ArrayList;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nationwide.shoppinglist.Entity.List;

@Repository
public interface ListRepository extends JpaRepository<List, Integer>{
	public ArrayList<List> findAll();
	public ArrayList<List> findByPurchased(boolean purchased);
//	public ArrayList<List> findByOrderByTotalAsc();
//	public ArrayList<List> findByOrderByTotalDes();
	public List findById(int id);
}