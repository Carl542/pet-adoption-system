const supabase = require('../supabaseClient');

// Get overall statistics
exports.getOverallStatistics = async (req, res) => {
  try {
    // Total pets in system
    const { count: totalPets, error: totalError } = await supabase
      .from('dim_pet')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Adopted pets (pets in fact_adoptions)
    const { count: adoptedPets, error: adoptedError } = await supabase
      .from('fact_adoptions')
      .select('*', { count: 'exact', head: true });

    if (adoptedError) throw adoptedError;

    // Available pets = total - adopted
    const availablePets = (totalPets || 0) - (adoptedPets || 0);

    const stats = {
      totalPets: totalPets || 0,
      availablePets: availablePets,
      adoptedPets: adoptedPets || 0,
      adoptionRate: totalPets > 0 ? ((adoptedPets / totalPets) * 100).toFixed(1) : 0
    };

    res.json({ data: stats, error: null });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ data: null, error: error.message });
  }
};

// Get monthly adoption trends
exports.getMonthlyTrends = async (req, res) => {
  try {
    // Use the view we created or query directly
    const { data, error } = await supabase
      .from('fact_adoptions')
      .select(`
        fact_id,
        dim_date (
          date,
          month,
          year,
          month_name
        )
      `)
      .order('date_id', { ascending: true });

    if (error) throw error;

    // Group by month
    const monthlyData = {};
    data.forEach(adoption => {
      const date = adoption.dim_date;
      const monthKey = `${date.year}-${String(date.month).padStart(2, '0')}`;
      const monthLabel = `${date.month_name} ${date.year}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { 
          month: monthLabel, 
          monthKey, 
          count: 0,
          year: date.year,
          monthNum: date.month
        };
      }
      monthlyData[monthKey].count++;
    });

    const result = Object.values(monthlyData).sort((a, b) => 
      a.monthKey.localeCompare(b.monthKey)
    );

    res.json({ data: result, error: null });
  } catch (error) {
    console.error('Error getting monthly trends:', error);
    res.status(500).json({ data: [], error: error.message });
  }
};

// Get adoption rates by species
exports.getSpeciesRates = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fact_adoptions')
      .select(`
        fact_id,
        dim_pet (
          species
        )
      `);

    if (error) throw error;

    // Count by species
    const speciesCount = {};
    data.forEach(adoption => {
      const species = adoption.dim_pet?.species || 'Unknown';
      speciesCount[species] = (speciesCount[species] || 0) + 1;
    });

    const result = Object.entries(speciesCount).map(([species, count]) => ({
      species,
      count,
      percentage: 0
    }));

    const total = result.reduce((sum, item) => sum + item.count, 0);
    result.forEach(item => {
      item.percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
    });

    result.sort((a, b) => b.count - a.count);
    
    res.json({ data: result, error: null });
  } catch (error) {
    console.error('Error getting species rates:', error);
    res.status(500).json({ data: [], error: error.message });
  }
};

// Get average shelter stay (processing time)
exports.getAverageShelterStay = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fact_adoptions')
      .select(`
        fact_id,
        processing_time_days,
        dim_pet (
          species
        )
      `);

    if (error) throw error;

    // Group by species
    const speciesStats = {};
    data.forEach(adoption => {
      const species = adoption.dim_pet?.species || 'Unknown';
      const days = adoption.processing_time_days || 0;

      if (!speciesStats[species]) {
        speciesStats[species] = { 
          species, 
          totalDays: 0, 
          count: 0 
        };
      }
      speciesStats[species].totalDays += days;
      speciesStats[species].count += 1;
    });

    const result = Object.values(speciesStats).map(stat => ({
      species: stat.species,
      avgDays: stat.count > 0 ? Math.round(stat.totalDays / stat.count) : 0,
      count: stat.count
    }));

    // Calculate overall average
    const totalDays = data.reduce((sum, item) => sum + (item.processing_time_days || 0), 0);
    const overallAvg = data.length > 0 ? Math.round(totalDays / data.length) : 0;

    res.json({ data: result, overall: overallAvg, error: null });
  } catch (error) {
    console.error('Error getting average shelter stay:', error);
    res.status(500).json({ data: [], overall: 0, error: error.message });
  }
};

// Additional analytics: Adoption by age group
exports.getAdoptionByAgeGroup = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fact_adoptions')
      .select(`
        fact_id,
        dim_adopter (
          age_group
        )
      `);

    if (error) throw error;

    const ageGroupCount = {};
    data.forEach(adoption => {
      const ageGroup = adoption.dim_adopter?.age_group || 'Unknown';
      ageGroupCount[ageGroup] = (ageGroupCount[ageGroup] || 0) + 1;
    });

    const result = Object.entries(ageGroupCount).map(([age_group, count]) => ({
      age_group,
      count,
      percentage: 0
    }));

    const total = result.reduce((sum, item) => sum + item.count, 0);
    result.forEach(item => {
      item.percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
    });

    result.sort((a, b) => b.count - a.count);

    res.json({ data: result, error: null });
  } catch (error) {
    console.error('Error getting age group stats:', error);
    res.status(500).json({ data: [], error: error.message });
  }
};

// Additional analytics: Adoption by location
exports.getAdoptionByLocation = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fact_adoptions')
      .select(`
        fact_id,
        dim_adopter (
          location
        )
      `);

    if (error) throw error;

    const locationCount = {};
    data.forEach(adoption => {
      const location = adoption.dim_adopter?.location || 'Unknown';
      locationCount[location] = (locationCount[location] || 0) + 1;
    });

    const result = Object.entries(locationCount).map(([location, count]) => ({
      location,
      count,
      percentage: 0
    }));

    const total = result.reduce((sum, item) => sum + item.count, 0);
    result.forEach(item => {
      item.percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
    });

    result.sort((a, b) => b.count - a.count);

    res.json({ data: result, error: null });
  } catch (error) {
    console.error('Error getting location stats:', error);
    res.status(500).json({ data: [], error: error.message });
  }
};

// Additional analytics: Quarterly performance
exports.getQuarterlyPerformance = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fact_adoptions')
      .select(`
        fact_id,
        adoption_fee,
        dim_date (
          year,
          quarter
        )
      `);

    if (error) throw error;

    const quarterlyData = {};
    data.forEach(adoption => {
      const year = adoption.dim_date?.year;
      const quarter = adoption.dim_date?.quarter;
      const key = `${year}-Q${quarter}`;
      
      if (!quarterlyData[key]) {
        quarterlyData[key] = {
          period: key,
          year,
          quarter,
          adoptions: 0,
          totalRevenue: 0
        };
      }
      quarterlyData[key].adoptions++;
      quarterlyData[key].totalRevenue += adoption.adoption_fee || 0;
    });

    const result = Object.values(quarterlyData)
      .map(q => ({
        ...q,
        avgFee: q.adoptions > 0 ? (q.totalRevenue / q.adoptions).toFixed(2) : 0
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.quarter - b.quarter;
      });

    res.json({ data: result, error: null });
  } catch (error) {
    console.error('Error getting quarterly performance:', error);
    res.status(500).json({ data: [], error: error.message });
  }
};

// Additional analytics: Previous pet owner analysis
exports.getPreviousOwnerAnalysis = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fact_adoptions')
      .select(`
        fact_id,
        processing_time_days,
        dim_adopter (
          previous_pet_owner
        )
      `);

    if (error) throw error;

    const stats = {
      previousOwners: { count: 0, avgProcessingDays: 0, totalDays: 0 },
      newOwners: { count: 0, avgProcessingDays: 0, totalDays: 0 }
    };

    data.forEach(adoption => {
      const isPreviousOwner = adoption.dim_adopter?.previous_pet_owner;
      const days = adoption.processing_time_days || 0;

      if (isPreviousOwner) {
        stats.previousOwners.count++;
        stats.previousOwners.totalDays += days;
      } else {
        stats.newOwners.count++;
        stats.newOwners.totalDays += days;
      }
    });

    stats.previousOwners.avgProcessingDays = stats.previousOwners.count > 0
      ? Math.round(stats.previousOwners.totalDays / stats.previousOwners.count)
      : 0;

    stats.newOwners.avgProcessingDays = stats.newOwners.count > 0
      ? Math.round(stats.newOwners.totalDays / stats.newOwners.count)
      : 0;

    const result = [
      {
        category: 'Previous Pet Owners',
        count: stats.previousOwners.count,
        avgProcessingDays: stats.previousOwners.avgProcessingDays
      },
      {
        category: 'First-Time Pet Owners',
        count: stats.newOwners.count,
        avgProcessingDays: stats.newOwners.avgProcessingDays
      }
    ];

    res.json({ data: result, error: null });
  } catch (error) {
    console.error('Error getting previous owner analysis:', error);
    res.status(500).json({ data: [], error: error.message });
  }
};